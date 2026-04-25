package notifications

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"notifications-service/internal/database"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/robfig/cron/v3"
)

// NotificationDeliveryProvider - interface for notification delivery providers
type NotificationDeliveryProvider interface {
	Send(notification database.Notification) error
	Name() string
	IsUserConnected(userId string) bool
}

// NotificationManager - main notifications manager
type NotificationManager struct {
	db         *sql.DB
	cron       *cron.Cron
	providers  []NotificationDeliveryProvider
	wsClients  map[string][]*websocket.Conn // userId -> list of active connections
	upgrader   websocket.Upgrader
}

func NewNotificationManager(db *sql.DB) *NotificationManager {
	manager := &NotificationManager{
		db:        db,
		cron:      cron.New(cron.WithSeconds()),
		providers: make([]NotificationDeliveryProvider, 0),
		wsClients: make(map[string][]*websocket.Conn),
		upgrader: websocket.Upgrader{
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
			CheckOrigin: func(r *http.Request) bool {
				return true // Allow all origins, configure in production
			},
		},
	}

	// Register default providers
	manager.RegisterProvider(manager) // Default WebSocket provider

	return manager
}

// RegisterProvider - adds new notification delivery provider
func (m *NotificationManager) RegisterProvider(provider NotificationDeliveryProvider) {
	m.providers = append(m.providers, provider)
	log.Printf("✅ Registered notification provider: %s", provider.Name())
}

// Start - starts notification scheduler
func (m *NotificationManager) Start() {
	// Check notifications every minute
	m.cron.AddFunc("0 * * * * *", m.checkAndSendNotifications)

	// Reload all active notifications every 15 minutes
	m.cron.AddFunc("0 0/15 * * * *", m.ReloadSchedules)

	m.cron.Start()
	log.Println("🚀 Notification scheduler started")

	m.ReloadSchedules()
}

// Stop - stops the scheduler
func (m *NotificationManager) Stop() {
	m.cron.Stop()
}

// checkAndSendNotifications - checks notifications that should trigger right now
func (m *NotificationManager) checkAndSendNotifications() {
	now := time.Now()
	currentTime := now.Format("15:04")
	currentWeekday := strings.ToLower(now.Weekday().String())

	// Маппинг русских дней на английские для совместимости с фронтендом
	dayMapping := map[string]string{
		"пн": "monday",
		"вт": "tuesday",
		"ср": "wednesday",
		"чт": "thursday",
		"пт": "friday",
		"сб": "saturday",
		"вс": "sunday",
		"monday":    "monday",
		"tuesday":   "tuesday",
		"wednesday": "wednesday",
		"thursday":  "thursday",
		"friday":    "friday",
		"saturday":  "saturday",
		"sunday":    "sunday",
		"everyday":  "everyday",
		"all":       "all",
		"ежедневно": "everyday",
		"все":       "all",
	}

	// Переводим текущий день на русский для проверки
	currentDayEnglish := currentWeekday
	currentDayRussian := ""
	switch currentWeekday {
	case "monday":
		currentDayRussian = "пн"
	case "tuesday":
		currentDayRussian = "вт"
	case "wednesday":
		currentDayRussian = "ср"
	case "thursday":
		currentDayRussian = "чт"
	case "friday":
		currentDayRussian = "пт"
	case "saturday":
		currentDayRussian = "сб"
	case "sunday":
		currentDayRussian = "вс"
	}

	log.Printf("🔍 Checking notifications for %s, day: %s (%s)", currentTime, currentWeekday, currentDayRussian)

	rows, err := m.db.Query(`
		SELECT id, user_id, category, title, time, days, comment, is_enabled, created_at, updated_at
		FROM notifications
		WHERE is_enabled = 1 AND time = ?
	`, currentTime)

	if err != nil {
		log.Printf("❌ Failed to fetch notifications: %v", err)
		return
	}
	defer rows.Close()

	var notificationsToSend []database.Notification

	for rows.Next() {
		var n database.Notification
		if err := rows.Scan(&n.ID, &n.UserID, &n.Category, &n.Title, &n.Time, &n.Days, &n.Comment, &n.IsEnabled, &n.CreatedAt, &n.UpdatedAt); err != nil {
			continue
		}

		// Check if today matches
		var days []string
		if err := json.Unmarshal([]byte(n.Days), &days); err != nil {
			continue
		}

		dayMatches := false
		for _, day := range days {
			normalizedDay := strings.ToLower(strings.TrimSpace(day))
			englishDay, hasMapping := dayMapping[normalizedDay]
			if !hasMapping {
				continue
			}

			if englishDay == "everyday" || englishDay == "all" {
				dayMatches = true
				break
			}

			if englishDay == currentDayEnglish || normalizedDay == currentDayRussian {
				dayMatches = true
				break
			}
		}

		if dayMatches {
			notificationsToSend = append(notificationsToSend, n)
		}
	}

	log.Printf("📨 Found %d notifications to send", len(notificationsToSend))

	// Send notifications through all registered providers
	for _, notification := range notificationsToSend {
		for _, provider := range m.providers {
			go func(p NotificationDeliveryProvider, n database.Notification) {
				if err := p.Send(n); err != nil {
					log.Printf("❌ Failed to send notification via %s: %v", p.Name(), err)
				} else {
					log.Printf("✅ Notification sent via %s to user %s", p.Name(), n.UserID)
				}
			}(provider, notification)
		}
	}
}

// ReloadSchedules - reloads all active notifications
func (m *NotificationManager) ReloadSchedules() {
	log.Println("🔄 Reloading notification schedules")
}

// ------------------------------
// WebSocket provider implementation
// ------------------------------

func (m *NotificationManager) Name() string {
	return "WebSocket Browser Provider"
}

func (m *NotificationManager) IsUserConnected(userId string) bool {
	_, exists := m.wsClients[userId]
	return exists && len(m.wsClients[userId]) > 0
}

func (m *NotificationManager) Send(notification database.Notification) error {
	connections, exists := m.wsClients[notification.UserID]
	if !exists || len(connections) == 0 {
		return fmt.Errorf("user %s not connected via WebSocket", notification.UserID)
	}

	payload := map[string]interface{}{
		"type": "notification",
		"data": notification,
	}

	sent := 0
	for _, conn := range connections {
		if err := conn.WriteJSON(payload); err == nil {
			sent++
		}
	}

	if sent == 0 {
		return fmt.Errorf("failed to send notification to any connection")
	}

	return nil
}

// HandleWebSocketConnection - handles new WebSocket connection
func (m *NotificationManager) HandleWebSocketConnection(c *gin.Context, userId string) {
	conn, err := m.upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("❌ Failed to upgrade WebSocket connection: %v", err)
		return
	}

	// Add connection to user list
	m.wsClients[userId] = append(m.wsClients[userId], conn)
	log.Printf("🔌 New WebSocket connection for user %s, total connections: %d", userId, len(m.wsClients[userId]))

	log.Printf("🔔 Sending test notification to user %s", userId)
    currentTime := time.Now().Format("15:04")
	// Send test notification on connect for verification
	testNotification := database.Notification{
		ID:        "test",
		UserID:    userId,
		Title:     "✅ Notification system connected",
		Comment:   "You will now receive reminders",
		Category:  "system",
		Time:      currentTime,
		IsEnabled: true,
	}

	conn.WriteJSON(map[string]interface{}{
		"type": "notification",
		"data": testNotification,
	})

	// Send welcome message
	conn.WriteJSON(map[string]interface{}{
		"type":    "connected",
		"message": "Successfully connected to notification service",
	})

	// Wait for connection close
	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			break
		}
	}

	// Remove closed connection
	conn.Close()
	m.removeConnection(userId, conn)
	log.Printf("🔌 WebSocket connection closed for user %s", userId)
}

func (m *NotificationManager) removeConnection(userId string, conn *websocket.Conn) {
	connections := m.wsClients[userId]
	for i, c := range connections {
		if c == conn {
			m.wsClients[userId] = append(connections[:i], connections[i+1:]...)
			break
		}
	}

	if len(m.wsClients[userId]) == 0 {
		delete(m.wsClients, userId)
	}
}

// GetUpcomingNotifications - returns notifications for next N minutes
func (m *NotificationManager) GetUpcomingNotifications(userId string, minutes int) ([]database.Notification, error) {
	// Implementation for upcoming notifications
	return nil, nil
}