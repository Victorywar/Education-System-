import api from './api';

export const loginAdmin = (data) => api.post('/admin/login', data);
export const getAdminStats = () => api.get('/admin/stats');
export const getPendingVolunteers = () => api.get('/admin/volunteers/pending');
export const updateVolunteerStatus = (id, data) => api.put(`/admin/volunteers/${id}/status`, data);
export const getAdminStudents = () => api.get('/admin/students');
export const getInactiveStudents = () => api.get('/admin/inactive-students');
export const deleteStudentAdmin = (id) => api.delete(`/admin/students/${id}`);
export const getAdminClasses = () => api.get('/admin/classes');
export const deleteClassAdmin = (id) => api.delete(`/admin/classes/${id}`);
