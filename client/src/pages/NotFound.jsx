// client/src/pages/NotFound.jsx
import React from "react";

export default function NotFound() {
  return (
    <>
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "calc(100vh - 64px)" }}>
        <div className="text-center">
          <div className="display-5 fw-bold mb-2">Sayfa Bulunamadı</div>
          <div className="text-muted">Aradığınız sayfa mevcut değil.</div>
        </div>
      </div>
    </>
  );
}
