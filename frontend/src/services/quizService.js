import api from './api';

/** Phase 10 — Quiz by skill (active learning flow) */
export const getQuizBySkill = (skillId) => api.get(`/quiz/skill/${skillId}`);
export const submitQuizBySkill = (skillId, answers) =>
  api.post(`/quiz/skill/${skillId}/submit`, { answers });

/** Legacy / course ObjectId paths (still supported by backend) */
export const getQuiz = (courseId) => api.get(`/quiz/${courseId}`);
export const submitQuiz = (courseId, answers) =>
  api.post(`/quiz/${courseId}/submit`, { answers });
export const getQuizResult = (resultId) => api.get(`/quiz/result/${resultId}`);
