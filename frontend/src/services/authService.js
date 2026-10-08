import api from './api';

export const registerStudent = (data) => api.post('/students/register', data);

export const loginStudent = (data) => api.post('/students/login', data);

export const logoutStudent = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
};

/** Used by AuthContext to restore session after refresh */
export const getMe = () => api.get('/auth/me');

/** Phase 9 — Volunteer login (prefer /volunteers/login) */
export const loginVolunteer = (data) => api.post('/volunteers/login', data);
