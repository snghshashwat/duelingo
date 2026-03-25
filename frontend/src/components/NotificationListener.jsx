import React, { useEffect } from "react";
import { useAuthStore } from "../store/gameStore";
import { useToastStore } from "../store/toastStore";
import { initializeSocket, onChallengeReceived, offAll } from "../api/socket";
import { userAPI } from "../api/client";

export default function NotificationListener() {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  useEffect(() => {
    if (!user) return;

    // Initialize socket connection
    initializeSocket(user.id, user.username);

    // Listen for incoming challenges
    onChallengeReceived((data) => {
      addToast({
        type: "info",
        icon: "challenge",
        title: "⚔️ New Challenge!",
        message: `${data.fromUsername} challenged you to a match!`,
        duration: 6000,
      });
    });

    // Poll for new friend requests and notifications
    const checkNewNotifications = async () => {
      try {
        const response = await userAPI.getNotifications();
        const notifications = response.data || [];

        // Find unread notifications
        for (const notification of notifications) {
          if (!notification.read) {
            if (notification.type === "friend_request") {
              addToast({
                type: "info",
                icon: "friend",
                title: "👥 Friend Request",
                message: `${notification.fromUsername} sent you a friend request!`,
                duration: 6000,
              });
              // Mark as read
              await userAPI
                .markNotificationsAsRead([notification._id])
                .catch(() => {});
            } else if (notification.type === "friend_accepted") {
              addToast({
                type: "success",
                icon: "friend",
                title: "👥 Friend Added!",
                message: `${notification.fromUsername} accepted your friend request!`,
                duration: 5000,
              });
              // Mark as read
              await userAPI
                .markNotificationsAsRead([notification._id])
                .catch(() => {});
            } else if (notification.type === "challenge") {
              // Don't show toast here as Challenge events use socket events
              // Mark as read
              await userAPI
                .markNotificationsAsRead([notification._id])
                .catch(() => {});
            }
          }
        }
      } catch (error) {
        console.error("Error checking notifications:", error);
      }
    };

    // Check for notifications every 5 seconds
    const notificationInterval = setInterval(checkNewNotifications, 5000);

    // Check immediately on mount
    checkNewNotifications();

    return () => {
      clearInterval(notificationInterval);
      offAll();
    };
  }, [user, addToast]);

  return null;
}
