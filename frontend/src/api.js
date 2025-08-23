import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000',
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const mesaj = err.response?.data?.mesaj || 'Hata';
    alert(mesaj);
    return Promise.reject(err);
  }
);

export default api;
