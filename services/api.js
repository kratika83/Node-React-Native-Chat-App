import axios from "axios";

const API_URL = "http://localhost:5000/api"; // adjust if using device

export const register = (data) => axios.post(`${API_URL}/users/register`, data);
export const login = (data) => axios.post(`${API_URL}/users/login`, data);

export const getUsers = (token) =>
  axios.get(`${API_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const createConversation = (withUserId, token) =>
  axios.post(`${API_URL}/conversations`, { withUserId }, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getMessages = (convId, token) =>
  axios.get(`${API_URL}/conversations/${convId}/messages`, {
    headers: { Authorization: `Bearer ${token}` },
  });