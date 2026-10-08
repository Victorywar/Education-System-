import api from './api';

export const getCourses = () => api.get('/courses');
export const getCourseById = (courseId) => api.get(`/courses/${courseId}`);
export const getLearningModule = (courseId, moduleIndex) =>
  api.get(`/courses/${courseId}/learn`, { params: { module: moduleIndex } });
