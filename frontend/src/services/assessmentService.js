import api from './api';

export const getQuestions = () => api.get('/assessment/questions');
export const submitAssessment = (answers) => api.post('/assessment/submit', { answers });
