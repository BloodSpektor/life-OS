package database

import (
	"database/sql"
	"log"

	_ "modernc.org/sqlite"
)

type Notification struct {
	ID        string `json:"id"`
	UserID    string `json:"userId"`
	Category  string `json:"category"`
	Title     string `json:"title"`
	Time      string `json:"time"`
	Days      string `json:"days"` // JSON array as string
	Comment   string `json:"comment"`
	IsEnabled bool   `json:"isEnabled"`
	CreatedAt string `json:"createdAt"`
	UpdatedAt string `json:"updatedAt"`
}

func InitDB(filepath string) (*sql.DB, error) {
	db, err := sql.Open("sqlite", filepath)
	if err != nil {
		return nil, err
	}

	if err = db.Ping(); err != nil {
		return nil, err
	}

	// Create notifications table
	createTableSQL := `
	CREATE TABLE IF NOT EXISTS notifications (
		id TEXT PRIMARY KEY,
		user_id TEXT NOT NULL,
		category TEXT NOT NULL,
		title TEXT NOT NULL,
		time TEXT NOT NULL,
		days TEXT NOT NULL,
		comment TEXT,
		is_enabled BOOLEAN NOT NULL DEFAULT 1,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);
	CREATE INDEX IF NOT EXISTS idx_user_id ON notifications(user_id);
	CREATE INDEX IF NOT EXISTS idx_category ON notifications(category);
	`

	if _, err = db.Exec(createTableSQL); err != nil {
		return nil, err
	}

	log.Println("✅ Database initialized successfully")
	return db, nil
}
