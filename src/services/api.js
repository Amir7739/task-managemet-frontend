import axios from "axios";

const API_URL = "https://task-management-backend-jxvg.onrender.com/api";

export const loginUser = async (email, password) => {
  const response = await axios.post(`${API_URL}/auth/login`, {
    email,
    password,
  });
  return response.data;
};

export const registerUser = async (name, email, password,role) => {
  const response = await axios.post(`${API_URL}/auth/register`, {
    name,
    email,
    password,
    role
  });
  return response.data;
};

export const getTasks = async (token, page = 1, limit = 10) => {
  const response = await axios.get(`${API_URL}/tasks/get`, {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      page,
      limit,
    },
  });
  return response.data;
};

export const createTask = async (task, token) => {
  const response = await axios.post(`${API_URL}/tasks/create`, task, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateTask = async (taskId, task, token) => {
  const response = await axios.put(`${API_URL}/tasks/update/${taskId}`, task, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteTask = async (taskId, token) => {
  const response = await axios.delete(`${API_URL}/tasks/delete/${taskId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
