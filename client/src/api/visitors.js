import axios from 'axios';

const BASE = '/api/visitors';

export const getVisitors   = ()      => axios.get(BASE).then(r => r.data);
export const createVisitor = (data)  => axios.post(BASE, data).then(r => r.data);
export const deleteOne     = (id)    => axios.delete(`${BASE}/${id}`).then(r => r.data);
export const deleteMany    = (ids)   => axios.delete(`${BASE}/bulk`, { data: { ids } }).then(r => r.data);
