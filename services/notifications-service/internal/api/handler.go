package api

import (
	"database/sql"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"notifications-service/internal/database"
	"notifications-service/internal/middleware"
)

type Handler struct {
	db *sql.DB
}

type CreateNotificationRequest struct {
	Category string   `json:"category" binding:"required"`
	Title    string   `json:"title" binding:"required"`
	Time     string   `json:"time" binding:"required"`
	Days     []string `json:"days" binding:"required"`
	Comment  string   `json:"comment"`
}

type UpdateNotificationRequest struct {
	Category  *string  `json:"category"`
	Title     *string  `json:"title"`
	Time      *string  `json:"time"`
	Days      []string `json:"days"`
	Comment   *string  `json:"comment"`
	IsEnabled *bool    `json:"isEnabled"`
}

func SetupRouter(db *sql.DB) *gin.Engine {
	router := gin.Default()

	// CORS middleware
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	handler := &Handler{db: db}

	api := router.Group("/api")
	api.Use(middleware.JWTAuth()) // Применяем JWT middleware ко всем эндпоинтам
	{
		api.GET("/notifications", handler.GetNotifications)
		api.GET("/notifications/active", handler.GetActiveNotifications)
		api.GET("/notifications/:id", handler.GetNotification)
		api.POST("/notifications", handler.CreateNotification)
		api.PATCH("/notifications/:id", handler.UpdateNotification)
		api.DELETE("/notifications/:id", handler.DeleteNotification)
	}

	return router
}

func (h *Handler) GetNotifications(c *gin.Context) {
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	rows, err := h.db.Query(`
		SELECT id, user_id, category, title, time, days, comment, is_enabled, created_at, updated_at
		FROM notifications
		WHERE user_id = ?
		ORDER BY time ASC
	`, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	notifications := []database.Notification{}
	for rows.Next() {
		var n database.Notification
		if err := rows.Scan(&n.ID, &n.UserID, &n.Category, &n.Title, &n.Time, &n.Days, &n.Comment, &n.IsEnabled, &n.CreatedAt, &n.UpdatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		notifications = append(notifications, n)
	}

	c.JSON(http.StatusOK, notifications)
}

func (h *Handler) GetActiveNotifications(c *gin.Context) {
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	rows, err := h.db.Query(`
		SELECT id, user_id, category, title, time, days, comment, is_enabled, created_at, updated_at
		FROM notifications
		WHERE user_id = ? AND is_enabled = 1
		ORDER BY time ASC
	`, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	notifications := []database.Notification{}
	for rows.Next() {
		var n database.Notification
		if err := rows.Scan(&n.ID, &n.UserID, &n.Category, &n.Title, &n.Time, &n.Days, &n.Comment, &n.IsEnabled, &n.CreatedAt, &n.UpdatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		notifications = append(notifications, n)
	}

	c.JSON(http.StatusOK, notifications)
}

func (h *Handler) GetNotification(c *gin.Context) {
	id := c.Param("id")
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var n database.Notification
	err := h.db.QueryRow(`
		SELECT id, user_id, category, title, time, days, comment, is_enabled, created_at, updated_at
		FROM notifications
		WHERE id = ? AND user_id = ?
	`, id, userID).Scan(&n.ID, &n.UserID, &n.Category, &n.Title, &n.Time, &n.Days, &n.Comment, &n.IsEnabled, &n.CreatedAt, &n.UpdatedAt)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Notification not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, n)
}

func (h *Handler) CreateNotification(c *gin.Context) {
	var req CreateNotificationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	id := uuid.New().String()
	now := time.Now().Format(time.RFC3339)

	// Convert days array to JSON string
	daysJSON := "[]"
	if len(req.Days) > 0 {
		daysJSON = `["` + req.Days[0]
		for i := 1; i < len(req.Days); i++ {
			daysJSON += `","` + req.Days[i]
		}
		daysJSON += `"]`
	}

	_, err := h.db.Exec(`
		INSERT INTO notifications (id, user_id, category, title, time, days, comment, is_enabled, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
	`, id, userID, req.Category, req.Title, req.Time, daysJSON, req.Comment, now, now)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	notification := database.Notification{
		ID:        id,
		UserID:    userID.(string),
		Category:  req.Category,
		Title:     req.Title,
		Time:      req.Time,
		Days:      daysJSON,
		Comment:   req.Comment,
		IsEnabled: true,
		CreatedAt: now,
		UpdatedAt: now,
	}

	c.JSON(http.StatusCreated, notification)
}

func (h *Handler) UpdateNotification(c *gin.Context) {
	id := c.Param("id")
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req UpdateNotificationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if notification exists
	var existsCheck bool
	err := h.db.QueryRow("SELECT EXISTS(SELECT 1 FROM notifications WHERE id = ? AND user_id = ?)", id, userID).Scan(&existsCheck)
	if err != nil || !existsCheck {
		c.JSON(http.StatusNotFound, gin.H{"error": "Notification not found"})
		return
	}

	now := time.Now().Format(time.RFC3339)

	// Build dynamic update query
	query := "UPDATE notifications SET updated_at = ?"
	args := []interface{}{now}

	if req.Category != nil {
		query += ", category = ?"
		args = append(args, *req.Category)
	}
	if req.Title != nil {
		query += ", title = ?"
		args = append(args, *req.Title)
	}
	if req.Time != nil {
		query += ", time = ?"
		args = append(args, *req.Time)
	}
	if req.Days != nil {
		daysJSON := "[]"
		if len(req.Days) > 0 {
			daysJSON = `["` + req.Days[0]
			for i := 1; i < len(req.Days); i++ {
				daysJSON += `","` + req.Days[i]
			}
			daysJSON += `"]`
		}
		query += ", days = ?"
		args = append(args, daysJSON)
	}
	if req.Comment != nil {
		query += ", comment = ?"
		args = append(args, *req.Comment)
	}
	if req.IsEnabled != nil {
		query += ", is_enabled = ?"
		args = append(args, *req.IsEnabled)
	}

	query += " WHERE id = ? AND user_id = ?"
	args = append(args, id, userID)

	_, err = h.db.Exec(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Fetch updated notification
	var n database.Notification
	err = h.db.QueryRow(`
		SELECT id, user_id, category, title, time, days, comment, is_enabled, created_at, updated_at
		FROM notifications
		WHERE id = ? AND user_id = ?
	`, id, userID).Scan(&n.ID, &n.UserID, &n.Category, &n.Title, &n.Time, &n.Days, &n.Comment, &n.IsEnabled, &n.CreatedAt, &n.UpdatedAt)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, n)
}

func (h *Handler) DeleteNotification(c *gin.Context) {
	id := c.Param("id")
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	result, err := h.db.Exec("DELETE FROM notifications WHERE id = ? AND user_id = ?", id, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Notification not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Notification deleted successfully"})
}
