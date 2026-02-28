import { io } from "socket.io-client";
import Constants from "expo-constants";
 const backendUrl = Constants.expoConfig.extra.apiUrl;

const socket = io(backendUrl, {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 3000,
  withCredentials: true,
});

socket.on("connect", () => {
  console.log("Connected to socket server:");
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error);
});

export default socket;