import api from '../utils/axiosConfig';

export const getSearchHistories = async () => {
  const response = await api.get('/history');
  return response.data;
};

export const getSearchHistory = async (id) => {
  const response = await api.get(`/history/${id}`);
  return response.data;
};

export const deleteSearchHistory = async (id) => {
  const response = await api.delete(`/history/${id}`);
  return response.data;
};