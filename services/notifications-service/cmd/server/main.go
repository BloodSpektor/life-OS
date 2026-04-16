package main

import (
	"log"
	"notifications-service/internal/api"
	"notifications-service/internal/database"
)

func main() {
	// Initialize database
	db, err := database.InitDB("./notifications.db")
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer db.Close()

	// Initialize and start API server
	router := api.SetupRouter(db)

	log.Println("🚀 Notifications API running on http://localhost:3002")
	if err := router.Run(":3002"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
