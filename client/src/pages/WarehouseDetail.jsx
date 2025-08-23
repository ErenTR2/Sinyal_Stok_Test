import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

export default function WarehouseDetail(){
  const { kod } = useParams();
  const [q, setQ] = useState("");
  const [rows, setRows] = useState([]);

  useEffect(()=>{
    // TODO: backend'den depo envanteri
    setRows([
      { kod:"KAB-001", ad:"Kablo 2x1.5", miktar:80 },
      { kod:"SIG-010", ad:"Sigorta 10A", miktar:15 },
      { kod:"ROLE-24", ad:"Röle 24V", miktar:3 },
    ]);
  },[kod]);

  const filtered = useMemo(()=>{
    const s = q.trim().toLowerCase();
    if(!s) return rows;
    return rows.filter(r => r.kod.toLowerCase().includes(s) || r.ad.toLowerCase().includes(s));
  },[rows,q]);

  return (
    <div className="bg-white rounded-2xl shadow p-3 p-md-4">
      <div className="d-flex align-items-center justify-content-between">
        <h5 className="mb-0">Depo: {kod}</h5>
        <input className="form-control" style={{maxWidth:280}} placeholder="Bu depoda ara…" value={q} onChange={e=>setQ(e.target.value)} />
      </div>

      <div className="table-responsive mt-3">
        <table className="table table-hover align-middle">
          <thead className="table-light"><tr><th>Stok Kodu</th><th>Ürün Adı</th><th>Miktar</th></tr></thead>
          <tbody>
            {filtered.length===0 ? <tr><td colSpan={3} className="text-muted py-4">Kayıt yok.</td></tr> :
              filtered.map(r=>(
                <tr key={r.kod}><td className="fw-semibold">{r.kod}</td><td>{r.ad}</td><td>{r.miktar}</td></tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
