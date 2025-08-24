// client/src/App.jsx
import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import TopBar from "./TopBar.jsx";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Verify from "./pages/Verify.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Products from "./pages/Products.jsx";
import Warehouses from "./pages/Warehouses.jsx";
import Movements from "./pages/Movements.jsx";
import CriticalStocks from "./pages/CriticalStocks.jsx";
import Inbound from "./pages/Inbound.jsx";
import Outbound from "./pages/Outbound.jsx";
import Settings from "./pages/Settings.jsx";
import NotFound from "./pages/NotFound.jsx";
import RoleGate from "./components/RoleGate.jsx";
import Profile from "./pages/Profile.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";


function Protected({ children }) {
  const token = sessionStorage.getItem("token");
  const location = useLocation();
  if (!token) return <Navigate to="/giris" replace state={{ from: location }} />;
  return children;
}

function Layout({ children }) {
  return (
    <div className="min-vh-100 bg-light">
      <TopBar />
      <main className="container py-3">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public (artık TopBar + kırmızı şerit var) */}
      <Route path="/giris" element={<Layout><Login /></Layout>} />
      <Route path="/kayit" element={<Layout><Register /></Layout>} />
      <Route path="/dogrulama" element={<Layout><Verify /></Layout>} />

      {/* Protected */}
      <Route path="/anasayfa" element={<Protected><Layout><Dashboard /></Layout></Protected>} />
      <Route path="/urunler" element={<Protected><Layout><Products /></Layout></Protected>} />
      <Route path="/depolar" element={<Protected><Layout><Warehouses /></Layout></Protected>} />
      <Route path="/hareketler" element={<Protected><Layout><Movements /></Layout></Protected>} />
      <Route path="/rapor/kritik-stok" element={<Protected><Layout><CriticalStocks /></Layout></Protected>} />
      <Route path="/gelen" element={<Protected><Layout><Inbound /></Layout></Protected>} />
      <Route path="/giden" element={<Protected><Layout><Outbound /></Layout></Protected>} />
      <Route path="/ayarlar" element={<Protected><Layout><Settings /></Layout></Protected>} />
      <Route path="/profil" element={<Protected><Layout><Profile/></Layout></Protected>} />
      <Route path="/urun/:kod" element={<Protected><Layout><ProductDetail/></Layout></Protected>} />

      {/* Ana sayfa */}
      <Route path="/" element={<Navigate to="/anasayfa" replace />} />
      <Route path="*" element={<Layout><NotFound /></Layout>} />
    </Routes>
  );
}
