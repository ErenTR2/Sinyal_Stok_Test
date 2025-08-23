// client/src/components/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const link = ({ isActive }) =>
    "list-group-item list-group-item-action d-flex align-items-center gap-2 " +
    (isActive ? "active" : "");

  return (
    <aside className="d-none d-md-block col-md-3 col-lg-2 p-0 border-end bg-white">
      <div className="list-group list-group-flush sticky-top" style={{ top: 60 }}>
        <NavLink to="/anasayfa" className={link}>
          <i className="bi bi-speedometer2"></i> Ana Sayfa
        </NavLink>
        <NavLink to="/urunler" className={link}>
          <i className="bi bi-box-seam"></i> Ürünler
        </NavLink>
        <NavLink to="/depolar" className={link}>
          <i className="bi bi-building"></i> Depolar
        </NavLink>
        <NavLink to="/hareketler" className={link}>
          <i className="bi bi-arrows-move"></i> Hareketler
        </NavLink>
        <NavLink to="/raporlar" className={link}>
          <i className="bi bi-graph-up"></i> Raporlar
        </NavLink>
        <NavLink to="/ayarlar" className={link}>
          <i className="bi bi-gear"></i> Ayarlar
        </NavLink>
      </div>
    </aside>
  );
}
