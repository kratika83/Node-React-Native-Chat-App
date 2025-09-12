import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000"; // adjust if using device

let socket = null;

export const connectSocket = (token) => {
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true
  });

  socket.on('connect_error', (err) => {
    console.warn('socket connect_error', err.message);
  });

  return socket;
};

export const getSocket = () => socket;
