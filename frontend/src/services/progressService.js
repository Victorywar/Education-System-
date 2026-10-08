import api from './api';

/** Phase 8 — Learning progress */
export const getAllProgress = () => api.get('/progress');
export const getSkillProgress = (skillId) => api.get(`/progress/${skillId}`);
export const completeModule = (skillId, moduleId) =>
  api.post(`/progress/${skillId}/module/${moduleId}/complete`);
export const getLevelChallenge = (skillId, levelNumber) =>
  api.get(`/progress/${skillId}/level/${levelNumber}`);
export const checkLevelAnswer = (skillId, levelNumber, answer) =>
  api.post(`/progress/${skillId}/level/${levelNumber}/answer`, answer);
export const submitLevel = (skillId, levelNumber, answers) =>
  api.post(`/progress/${skillId}/level/${levelNumber}/submit`, { answers });
