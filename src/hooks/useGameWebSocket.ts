import { useCallback, useEffect } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { useGameStore } from "../stores/gameStore.ts";
import { useAuth } from "../auths/AuthContext";

export const useGameWebSocket = (roomId: string | number) => {
  const { updateGameState, setLoading, removePlayerData } = useGameStore();
  const { token: authToken } = useAuth();

  const socketUrl =
    roomId && authToken
      ? `ws://0.0.0.0:8000/ws/game/${roomId}/?token=${authToken}`
      : null;

  const {
    sendMessage,
    lastMessage,
    readyState,
    // getWebSocket
  } = useWebSocket(socketUrl, {
    onOpen: () => {
      console.log("WebSocket connected");
    },
    onClose: () => {
      console.log("WebSocket disconnected");
    },
    onError: (event) => {
      console.error("WebSocket error:", event);
    },
    shouldReconnect: (closeEvent) => {
      return closeEvent.code !== 1000;
    },
    reconnectAttempts: 5,
    reconnectInterval: 3000,
  });

  useEffect(() => {
    if (lastMessage !== null) {
      try {
        const data = JSON.parse(lastMessage.data);
        console.log("Received message:", data);

        if (data.type === "update") {
          // FIX: Directly pass the server state to the update function.
          // Do NOT remove game_type from the config - server is source of truth
          updateGameState(data.state);
        } else if (
          data.type === "player_disconnect" ||
          data.type === "player_disconnected"
        ) {
          if (data.player_id) {
            console.log(`Player ${data.player_id} disconnected`);
            removePlayerData(data.player_id);
          }
          if (data.state) {
            updateGameState(data.state);
          }
        } else if (
          data.type === "player_left" ||
          data.type === "player_leave"
        ) {
          if (data.player_id) {
            console.log(`Player ${data.player_id} left`);
            removePlayerData(data.player_id);
          }
          if (data.state) {
            updateGameState(data.state);
          }
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    }
  }, [lastMessage, updateGameState, removePlayerData]);

  const sendGameMessage = useCallback(
    (type: string, payload: unknown) => {
      if (readyState === ReadyState.OPEN) {
        sendMessage(JSON.stringify({ type, payload }));
      }
    },
    [sendMessage, readyState]
  );

  const submitGuess = useCallback(
    (guess: string) => {
      setLoading(true);
      sendGameMessage("make_move", { guess, action: "submit_guess" });
    },
    [sendGameMessage, setLoading]
  );

  const resetGame = useCallback(() => {
    sendGameMessage("make_move", { action: "reset_game" });
  }, [sendGameMessage]);

  const updateServerGameType = useCallback(
    (gameType: string | number) => {
      sendGameMessage("update_config", { game_type: gameType });
    },
    [sendGameMessage]
  );

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Connected",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Disconnected",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  return {
    submitGuess,
    resetGame,
    updateServerGameType,
    isConnected: readyState === ReadyState.OPEN,
    isConnecting: readyState === ReadyState.CONNECTING,
    connectionStatus,
    readyState,
  };
};
