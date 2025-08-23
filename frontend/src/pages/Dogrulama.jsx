import { useEffect } from 'react';
import api from '../api';

export default function Dogrulama() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      api.get(`/dogrulama?token=${token}`).then(() => {
        alert('Hesap doğrulandı');
      });
    }
  }, []);

  return <div className="p-4">Doğrulama yapılıyor...</div>;
}
