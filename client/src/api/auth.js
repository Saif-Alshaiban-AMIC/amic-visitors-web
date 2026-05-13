import axios from 'axios';

axios.defaults.withCredentials = true;

export const login  = (username, password) => axios.post('/api/auth/login',  { username, password });
export const logout = ()                   => axios.post('/api/auth/logout');
export const getMe  = ()                   => axios.get('/api/auth/me');
