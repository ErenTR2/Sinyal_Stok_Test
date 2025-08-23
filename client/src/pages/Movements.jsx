// client/src/pages/Movements.jsx
import React, { useEffect, useState } from "react";

export default function Movements() {
  const [tab, setTab] = useState("hepsi");
  const [rows, setRows] = useState([]);

  useEffect(() => {
    // TODO: backend
    setRows([
      { id: 1, tarih: "2025-08-16 10:12", tip: "Giriş",  stokKod: "KAB-001", miktar: 100, depo: "Merkez", aciklama: "Satın alma #PO-987" },
      { id: 2, tarih: "2025-08-16 09:30", tip: "Çıkış",  stokKod: "SIG-010", miktar: 6,   depo: "Merkez", aciklama: "Bakım siparişi #WO-423" },
      { id: 3, tarih: "2025-08-15 15:48", tip: "Sayım",  stokKod: "ROLE-24", miktar: -2,  depo: "Ankara", aciklama: "Sayım farkı" },
      { id: 4, tarih: "2025-08-15 11:02", tip: "Transfer", stokKod: "LMB-220", miktar: 10, depo: "İzmir → Merkez", aciklama: "" },
    ]);
  }, []);

  const filtered = rows.filter((r) => (tab === "hepsi" ? true : r.tip === tab));

  const TabBtn = ({ id, text }) => (
    <button
      onClick={() => setTab(id)}
      className={"btn btn-sm " + (tab === id ? "btn-dark" : "btn-outline-secondary")}
    >
      {text}
    </button>
  );

  return (
    <div className="bg-white rounded-2xl shadow p-3 p-md-4">
      <div className="d-flex align-items-center justify-content-between">
        <h5 className="mb-0">Hareketler</h5>
        <div className="d-flex gap-2">
          <TabBtn id="hepsi" text="Hepsi" />
          <TabBtn id="Giriş" text="Giriş" />
          <TabBtn id="Çıkış" text="Çıkış" />
          <TabBtn id="Transfer" text="Transfer" />
          <TabBtn id="Sayım" text="Sayım" />
          <button className="btn btn-primary">+ Yeni Hareket</button>
        </div>
      </div>

      <div className="table-responsive mt-3">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Tarih</th>
              <th>Tip</th>
              <th>Stok Kodu</th>
              <th>Miktar</th>
              <th>Depo</th>
              <th>Açıklama</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-muted py-4">Kayıt yok.</td></tr>
            ) : filtered.map((h) => (
              <tr key={h.id}>
                <td className="whitespace-nowrap">{h.tarih}</td>
                <td>{h.tip}</td>
                <td className="fw-semibold">{h.stokKod}</td>
                <td>{h.miktar}</td>
                <td>{h.depo}</td>
                <td>{h.aciklama || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
