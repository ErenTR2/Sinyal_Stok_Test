// client/src/TopBar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import logoUrl from "./assets/logo.png";

export default function TopBar() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  return (
    <header className="topbar position-sticky top-0 z-3 position-relative">
      <div className="container-fluid py-2 d-flex align-items-center justify-content-between">
        {/* Logo (anasayfaya götür) */}
        <div
          className="d-flex align-items-center gap-2"
          style={{cursor:"pointer"}}
          onClick={()=>navigate("/anasayfa")}
          title="Ana sayfa"
        >
          <img src={logoUrl} alt="logo" width={32} height={32} style={{objectFit:"contain", borderRadius:6}} />
        </div>

        {/* Başlık (anasayfaya götür) */}
        <div
          className="text-center flex-fill header-title"
          style={{cursor:"pointer"}}
          onClick={()=>navigate("/anasayfa")}
          title="Ana sayfa"
        >
          Sinyal Stok Sistemi
        </div>

        {/* Profil (sadece giriş yapılmışsa) */}
        {token && (
          <button
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
            onClick={()=>navigate("/profil")}
            title="Profil"
          >
            <img
              src={sessionStorage.getItem("avatar") || "https://i.pravatar.cc/40"}
              alt="avatar" width={24} height={24} style={{borderRadius:"50%"}}
            />
            <span>Profil</span>
          </button>
        )}
      </div>
    </header>
  );
}
