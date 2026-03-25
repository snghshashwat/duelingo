import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/gameStore";
import { useGameStore } from "../store/gameStore";
import { useToastStore } from "../store/toastStore";
import {
  initializeSocket,
  onChallengeReceived,
  onChallengeAccepted,
  respondToChallenge,
  offAll,
} from "../api/socket";
import { userAPI } from "../api/client";

export default function NotificationListener() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { setWaiting, setGameStatus, setPendingMode, setGameType } =
    useGameStore();
  const { addToast } = useToastStore();
  const shownChallengeNotifications = useRef(new Set());

  useEffect(() => {
    if (!user) return;

    // Initialize socket connection
    initializeSocket(user.id, user.username);

    // Listen for incoming challenges
    onChallengeReceived((data) => {
      const gameType = data?.gameType || "QUIZ_SPRINT";
      addToast({
        type: "info",
        icon: "challenge",
        title: "⚔️ New Challenge!",
        message: `${data.fromUsername} challenged you to a ${
          gameType === "QUIZ_SPRINT" ? "Quiz Sprint" : "Match Pairs"
        } match.`,
        duration: 10000,
        actions: [
          {
            label: "Accept",
            onClick: () => {
              setWaiting(true);
              setGameStatus("waiting");
              setPendingMode("friend");
              setGameType(gameType);
              respondToChallenge(true, data.fromUserId, user.id, gameType);
              navigate("/game");
            },
          },
          {
            label: "Decline",
            variant: "danger",
            onClick: () => {
              respondToChallenge(false, data.fromUserId, user.id, gameType);
            },
          },
        ],
      });
    });

    onChallengeAccepted((data) => {
      setWaiting(true);
      setGameStatus("waiting");
      setPendingMode("friend");
      setGameType(data?.gameType || "QUIZ_SPRINT");
      navigate("/game");
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
              // Keep challenge unread in bell dropdown and show one actionable toast.
              if (!shownChallengeNotifications.current.has(notification._id)) {
                shownChallengeNotifications.current.add(notification._id);
                const gameType = notification.gameType || "QUIZ_SPRINT";

                addToast({
                  type: "info",
                  icon: "challenge",
                  title: "⚔️ Challenge Pending",
                  message: `${notification.fromUsername} challenged you to a ${
                    gameType === "QUIZ_SPRINT" ? "Quiz Sprint" : "Match Pairs"
                  } match.`,
                  duration: 10000,
                  actions: [
                    {
                      label: "Accept",
                      onClick: () => {
                        setWaiting(true);
                        setGameStatus("waiting");
                        setPendingMode("friend");
                        setGameType(gameType);
                        respondToChallenge(
                          true,
                          notification.fromUserId,
                          user.id,
                          gameType,
                        );
                        navigate("/game");
                      },
                    },
                    {
                      label: "Decline",
                      variant: "danger",
                      onClick: () => {
                        respondToChallenge(
                          false,
                          notification.fromUserId,
                          user.id,
                          gameType,
                        );
                      },
                    },
                  ],
                });
              }
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
  }, [
    user,
    addToast,
    navigate,
    setGameStatus,
    setGameType,
    setPendingMode,
    setWaiting,
  ]);

  return null;
}
