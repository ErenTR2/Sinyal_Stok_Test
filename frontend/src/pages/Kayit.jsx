import { useState } from 'react';
import useStore from '../store';

export default function Kayit() {
  const [eposta, setEposta] = useState('');
  const [sifre, setSifre] = useState('');
  const kayit = useStore((s) => s.kayit);

  const handle = async (e) => {
    e.preventDefault();
    await kayit(eposta, sifre);
    alert('Kayıt başarılı, e-postanızı kontrol edin');
  };

  return (
    <form onSubmit={handle} className="p-4 flex flex-col gap-2">
      <div className="flex">
        <input
          value={eposta}
          onChange={(e) => setEposta(e.target.value)}
          placeholder="E-posta başı"
          className="border p-2 flex-1"
        />
        <span className="p-2 border bg-gray-100">@sinyalizasyon.com</span>
      </div>
      <input
        type="password"
        value={sifre}
        onChange={(e) => setSifre(e.target.value)}
        placeholder="Şifre"
        className="border p-2"
      />
      <button className="bg-blue-500 text-white p-2">Kayit</button>
    </form>
  );
}
