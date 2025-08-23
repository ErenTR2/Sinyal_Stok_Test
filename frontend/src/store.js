import { create } from 'zustand';
import api from './api';

const DOMAIN = '@sinyalizasyon.com';

const useStore = create((set) => ({
  kullanici: null,
  giris: async (eposta, sifre) => {
    const email = eposta + DOMAIN;
    await api.post('/giris', { eposta: email, sifre });
    set({ kullanici: { eposta: email } });
  },
  kayit: async (ad, soyad, eposta, sifre, sifreTekrar) => {
    const email = eposta + DOMAIN;
    await api.post('/kayit', { ad, soyad, eposta: email, sifre, sifreTekrar });
  },
}));

export default useStore;
