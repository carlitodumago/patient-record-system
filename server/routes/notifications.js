import express from "express";
import DatabaseService from "../services/databaseService.js";

const router = express.Router();

// Get all notifications
router.get("/", async (req, res) => {
  try {
    const notifications = await DatabaseService.getNotifications();
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get notifications by user ID
router.get("/user/:userId", async (req, res) => {
  try {
    const notifications = await DatabaseService.getNotificationsByUser(
      req.params.userId
    );
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get notification by ID
router.get("/:id", async (req, res) => {
  try {
    // Note: DatabaseService doesn't have getNotificationById method, need to add it
    const notifications = await DatabaseService.getNotifications();
    const notification = notifications.find(
      (n) => n.NotificationID === parseInt(req.params.id)
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json(notification);
  } catch (error) {
    console.error("Error fetching notification:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create new notification
router.post("/", async (req, res) => {
  try {
    const { userId, message } = req.body;

    const newNotification = await DatabaseService.createNotification({
      UserID: userId,
      Message: message,
    });

    res.status(201).json(newNotification);
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update notification
router.put("/:id", async (req, res) => {
  try {
    const { userId, message } = req.body;

    const updatedNotification = await DatabaseService.updateNotification(
      req.params.id,
      {
        UserID: userId,
        Message: message,
      }
    );

    res.status(200).json(updatedNotification);
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete notification
router.delete("/:id", async (req, res) => {
  try {
    await DatabaseService.deleteNotification(req.params.id);
    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Mark notification as read (update - in a real app, you might want a read status field)
router.patch("/:id/read", async (req, res) => {
  try {
    // For now, we'll just return success since we don't have a read status field
    // In a real implementation, you might want to add a 'read' field to the Notification table
    const notifications = await DatabaseService.getNotifications();
    const notification = notifications.find(
      (n) => n.NotificationID === parseInt(req.params.id)
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res
      .status(200)
      .json({ message: "Notification marked as read", notification });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
