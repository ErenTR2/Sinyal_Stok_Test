// client/src/pages/Reports.jsx
import React from "react";


export default function Reports() {
  return (
    <div className="bg-white rounded-2xl shadow p-3 p-md-4">
      <h5>Raporlar</h5>
      <div className="row g-3 mt-1">
        <div className="col-md-4">
          <div className="card card-body h-100">
            <div className="fw-semibold mb-1">Günlük Hareket Raporu</div>
            <div className="text-muted small mb-2">Gün içinde giriş/çıkış/sayım</div>
            <button className="btn btn-outline-secondary btn-sm">İndir (CSV)</button>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card card-body h-100">
            <div className="fw-semibold mb-1">Kritik Stok Raporu</div>
            <div className="text-muted small mb-2">Kritik seviyenin altındaki ürünler</div>
            <button className="btn btn-outline-secondary btn-sm">İndir (CSV)</button>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card card-body h-100">
            <div className="fw-semibold mb-1">Depo Bazlı Envanter</div>
            <div className="text-muted small mb-2">Depo/Ürün bazlı miktarlar</div>
            <button className="btn btn-outline-secondary btn-sm">İndir (CSV)</button>
          </div>
        </div>
      </div>
    </div>
  );
}
