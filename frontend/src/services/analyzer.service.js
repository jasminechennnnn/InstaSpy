import api from '../utils/axiosConfig';

export const loginInstagram = async (username, password, code) => {
  const response = await api.post('/analyzer/login', { username, password, code });
  return response.data;
};

export const getFollowees = async (target) => {
  console.log("getFollowees() got param. target = ", target)
  const response = await api.get('/analyzer/fetch', { 
    params: { target } 
  });
  return response.data;
};

export const logoutInstagram = async () => {
  const response = await api.post('/analyzer/logout');
  return response.data;
};

export const triggerAnalysis = async (id) => {
  const response = await api.post(`/analyzer/analysis/${id}`);
  return response.data;
};