// client/src/pages/CriticalStocks.jsx
import React, { useEffect, useMemo, useState } from "react";

export default function CriticalStocks() {
  const [rows, setRows] = useState([]);
  const [depo, setDepo] = useState("hepsi");
  const [sort, setSort] = useState("ad_asc");

  useEffect(() => {
    // TODO: backend'den çek
    setRows([
      { kod: "KAB-001", ad: "Kablo 2x1.5", depo: "Merkez", miktar: 4, kritikSeviye: 10 },
      { kod: "SIG-010", ad: "Sigorta 10A", depo: "Merkez", miktar: 2, kritikSeviye: 8  },
      { kod: "ROLE-24", ad: "Röle 24V",   depo: "Ankara", miktar: 5, kritikSeviye: 12 },
      { kod: "LMB-220", ad: "Lamba 220V", depo: "İzmir",  miktar: 1, kritikSeviye: 6  },
    ]);
  }, []);

  const depolar = useMemo(
    () => ["hepsi", ...Array.from(new Set(rows.map(r => r.depo)))],
    [rows]
  );

  const filtered = rows.filter(r => depo === "hepsi" ? true : r.depo === depo);

  const sorted = [...filtered].sort((a,b) => {
    switch (sort) {
      case "ad_asc":  return a.ad.localeCompare(b.ad, "tr");
      case "ad_desc": return b.ad.localeCompare(a.ad, "tr");
      case "miktar_asc":  return a.miktar - b.miktar;
      case "miktar_desc": return b.miktar - a.miktar;
      default: return 0;
    }
  });

  return (
    <div className="bg-white rounded-2xl shadow p-3 p-md-4">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2">
        <h5 className="mb-0">Kritik Stoklar</h5>
        <div className="d-flex gap-2">
          <select className="form-select" value={depo} onChange={(e)=>setDepo(e.target.value)} style={{minWidth: 180}}>
            {depolar.map(d => <option key={d} value={d}>{d === "hepsi" ? "Tüm Depolar" : d}</option>)}
          </select>
          <select className="form-select" value={sort} onChange={(e)=>setSort(e.target.value)} style={{minWidth: 200}}>
            <option value="ad_asc">Ürün adına göre (A→Z)</option>
            <option value="ad_desc">Ürün adına göre (Z→A)</option>
            <option value="miktar_asc">Miktara göre (Artan)</option>
            <option value="miktar_desc">Miktara göre (Azalan)</option>
          </select>
        </div>
      </div>

      <div className="table-responsive mt-3">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Stok Kodu</th>
              <th>Ürün Adı</th>
              <th>Depo</th>
              <th>Miktar</th>
              <th>Kritik Seviye</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr><td colSpan={5} className="text-muted py-4">Kayıt yok.</td></tr>
            ) : sorted.map(r => (
              <tr key={`${r.kod}-${r.depo}`}>
                <td className="fw-semibold">{r.kod}</td>
                <td>{r.ad}</td>
                <td>{r.depo}</td>
                <td>{r.miktar}</td>
                <td>{r.kritikSeviye}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
