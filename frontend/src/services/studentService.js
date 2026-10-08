import api from './api';

/** Phase 3 — Dashboard overview from backend (source of truth) */
export const getDashboard = () => api.get('/students/dashboard');

/** Phase 3 — Authenticated student profile (no password) */
export const getStudentProfile = () => api.get('/students/profile');

/** Alias kept for existing imports */
export const getProfile = () => getStudentProfile();

/** Phase 4 — Assessment questions */
export const getAssessmentQuestions = () => api.get('/students/assessment/questions');

/** Phase 4 — Load saved assessment (for retake) */
export const getAssessment = () => api.get('/students/assessment');

/** Phase 4 — Submit / replace assessment answers */
export const submitAssessment = (answers) => api.post('/students/assessment', { answers });

/** Phase 5 — Personalized skill recommendations (from assessment) */
export const getRecommendations = () => api.get('/students/recommendations');
