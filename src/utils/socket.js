import { io } from "socket.io-client";

export const socket = io("http://localhost:5000", {
  autoConnect: false, // on connecte seulement après login
});
