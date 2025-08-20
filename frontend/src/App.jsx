import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Kayit from './pages/Kayit';
import Giris from './pages/Giris';
import Dogrulama from './pages/Dogrulama';
import Panel from './pages/Panel';
import Profil from './pages/Profil';
import Ayarlar from './pages/Ayarlar';
import Urunler from './pages/Urunler';
import Depolar from './pages/Depolar';
import Transferler from './pages/Transferler';
import GelenUrunler from './pages/GelenUrunler';
import GidenUrunler from './pages/GidenUrunler';
import StokDuzeltme from './pages/StokDuzeltme';
import useStore from './store';

function Nav() {
  return (
    <nav className="p-2 flex gap-2 bg-gray-200">
      <Link to="/panel">Panel</Link>
      <Link to="/profil">Profil</Link>
      <Link to="/ayarlar">Ayarlar</Link>
      <Link to="/urunler">Urunler</Link>
    </nav>
  );
}

export default function App() {
  const kullanici = useStore((s) => s.kullanici);
  return (
    <BrowserRouter>
      {kullanici && <Nav />}
      <Routes>
        <Route path="/kayit" element={<Kayit />} />
        <Route path="/giris" element={<Giris />} />
        <Route path="/dogrulama" element={<Dogrulama />} />
        <Route path="/panel" element={<Panel />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/ayarlar" element={<Ayarlar />} />
        <Route path="/urunler" element={<Urunler />} />
        <Route path="/depolar" element={<Depolar />} />
        <Route path="/transferler" element={<Transferler />} />
        <Route path="/gelen-urunler" element={<GelenUrunler />} />
        <Route path="/giden-urunler" element={<GidenUrunler />} />
        <Route path="/stok-duzeltme" element={<StokDuzeltme />} />
        <Route path="*" element={<Giris />} />
      </Routes>
    </BrowserRouter>
  );
}
