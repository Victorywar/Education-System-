import api from './api';

/** Phase 7 — Weekend / holiday community classes */
export const getClasses = () => api.get('/classes');
export const getClassById = (classId) => api.get(`/classes/${classId}`);
export const registerForClass = (classId) => api.post(`/classes/${classId}/register`);
export const getMyRegistrations = () => api.get('/classes/my-registrations');
