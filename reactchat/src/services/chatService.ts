import { useState } from "react";
import useWebSocket from "react-use-websocket";
import useCrud from "../hooks/useCrud";
import { useAuthService } from "./AuthServices";
import { WS_ROOT } from "../config";
import { ServerD } from "../@types/server";

interface Message {
  sender: string;
  content: string;
  timestamp: string;
}

const useChatWebSocket = (channelId: string, serverId: string) => {
  const [newMessage, setNewMessage] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const { logout, refreshAccessToken } = useAuthService();
  const { fetchData } = useCrud<ServerD>(
    [],
    `/messages/?channel_id=${channelId}`
  );

  const socketUrl = channelId
    ? `ws://127.0.0.1:8000/${serverId}/${channelId}`
    : null;

  const [reconnectionAttempts, setReconnectionAttempts] = useState(0);
  const maxConnectionAttempts = 4;

  const { sendJsonMessage } = useWebSocket(socketUrl, {
    onOpen: async () => {
      try {
        const data = await fetchData();
        setNewMessage([]);
        setNewMessage(Array.isArray(data) ? data : []);
        console.log("Connected!!!");
      } catch (error: any) {
        console.log(error);
      }
    },
    onClose: (event: CloseEvent) => {
      if (event.code == 4001) {
        console.log("Authentication Error");
        refreshAccessToken().catch((error) => {
          if (error.response && error.response.status === 401) {
            logout();
          }
        });
      }
      console.log("Close");
      setReconnectionAttempts((prevAttempt) => prevAttempt + 1);
    },
    onError: () => {
      console.log("Error!");
    },
    onMessage: (msg) => {
      const data = JSON.parse(msg.data);
      setNewMessage((prev_msg) => [...prev_msg, data.new_message]);
      setMessage("");
    },
    shouldReconnect: (closeEvent) => {
      if (
        closeEvent.code === 4001 &&
        reconnectionAttempts >= maxConnectionAttempts
      ) {
        setReconnectionAttempts(0);
        return false;
      }
      return false;
    },
    reconnectInterval: 1000,
  });

  return {
    newMessage,
    message,
    setMessage,
    sendJsonMessage,
  };
};

export default useChatWebSocket;
