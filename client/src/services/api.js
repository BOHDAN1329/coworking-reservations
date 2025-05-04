import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Налаштування axios для всіх запитів
axios.defaults.withCredentials = true; // Дозволяє передавати куки

// Додайте цей код для автоматичного встановлення токену
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['x-auth-token'] = token;
}

// Coworkings API
export const getCoworkings = async () => {
  try {
    const response = await axios.get(`${API_URL}/coworkings`);
    return response.data;
  } catch (error) {
    console.error('Error fetching coworkings:', error);
    throw error;
  }
};

export const getCoworking = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/coworkings/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching coworking with id ${id}:`, error);
    throw error;
  }
};

// Workspaces API
export const getWorkspacesByCoworking = async (coworkingId) => {
  try {
    const response = await axios.get(`${API_URL}/workspaces/coworking/${coworkingId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching workspaces for coworking ${coworkingId}:`, error);
    throw error;
  }
};

// Reservations API
export const createReservation = async (reservationData) => {
  try {
    const response = await axios.post(`${API_URL}/reservations`, reservationData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating reservation:', error);
    throw error;
  }
};

export const getUserReservations = async () => {
  try {
    const response = await axios.get(`${API_URL}/reservations`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user reservations:', error);
    throw error;
  }
};

export const cancelReservation = async (id) => {
  try {
    const response = await axios.put(`${API_URL}/reservations/${id}/cancel`);
    return response.data;
  } catch (error) {
    console.error(`Error cancelling reservation ${id}:`, error);
    throw error;
  }
};

export default {
  getCoworkings,
  getCoworking,
  getWorkspacesByCoworking,
  createReservation,
  getUserReservations,
  cancelReservation
};