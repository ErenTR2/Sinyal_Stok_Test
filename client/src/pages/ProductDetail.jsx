// client/src/pages/ProductDetail.jsx
import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RoleGate from "../components/RoleGate.jsx";

const PINNED = "Genel Stok";

// DEMO amaçlı: gerçek sistemde API'den ürün çekilecek
const demo = [
  { kod:"KAB-001", ad:"Kablo 2x1.5", stok:{ [PINNED]:120, Merkez:80, Ankara:20, İzmir:20 }, kritik:10 },
  { kod:"SIG-010", ad:"Sigorta 10A", stok:{ [PINNED]:35,  Merkez:15, Ankara:10, İzmir:10 }, kritik:8  },
  { kod:"ROLE-24", ad:"Röle 24V",    stok:{ [PINNED]:12,  Merkez:3,  Ankara:5,  İzmir:4  },  kritik:6  },
];

export default function ProductDetail(){
  const { kod } = useParams();
  const nav = useNavigate();

  const item = useMemo(()=> demo.find(x=>x.kod === decodeURIComponent(kod||"")), [kod]);
  const depolar = useMemo(()=> {
    const keys = Object.keys(item?.stok || {});
    return [PINNED, ...keys.filter(k=>k!==PINNED)];
  }, [item]);

  if (!item) {
    return (
      <div className="bg-white rounded-2xl shadow p-4">
        <div className="d-flex align-items-center justify-content-between">
          <h5 className="mb-0">Ürün bulunamadı</h5>
          <button className="btn btn-outline-secondary" onClick={()=>nav("/urunler")}>Ürün listesine dön</button>
        </div>
        <div className="text-muted mt-3">Kod: {kod}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow p-3 p-md-4">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
        <div>
          <div className="text-muted small mb-1" style={{cursor:"pointer"}} onClick={()=>nav("/urunler")}>Ürünler</div>
          <h4 className="mb-0">{item.kod} – {item.ad}</h4>
        </div>
        <RoleGate allow={["yönetici","depocu"]}>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary" onClick={()=>nav(`/stok-guncelle?kod=${encodeURIComponent(item.kod)}`)}>Stok Güncelle</button>
            <button className="btn btn-primary" onClick={()=>nav(`/transfer?kod=${encodeURIComponent(item.kod)}`)}>Depolar Arası Transfer</button>
          </div>
        </RoleGate>
      </div>

      <div className="row g-3 mt-3">
        <div className="col-12 col-md-6">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted small">Genel Stok</div>
                  <div className="display-6">{item.stok[PINNED] ?? 0}</div>
                </div>
                <div>
                  <div className="text-muted small">Kritik Seviye</div>
                  <div className="h4 mb-0">{item.kritik}</div>
                </div>
              </div>
              <div className="text-muted small mt-2">Aşağıda depolara göre dağılım:</div>
              <div className="table-responsive mt-2">
                <table className="table table-sm">
                  <thead className="table-light">
                    <tr><th>Depo</th><th className="text-end">Miktar</th></tr>
                  </thead>
                  <tbody>
                    {depolar.filter(d=>d!==PINNED).map(d=>(
                      <tr key={d}><td>{d}</td><td className="text-end">{item.stok[d] ?? 0}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Hareket günlüğü – şu an demo placeholder */}
        <div className="col-12 col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <h6 className="mb-0">Hareket Günlüğü</h6>
                <button className="btn btn-sm btn-outline-secondary" disabled>CSV</button>
              </div>
              <div className="text-muted small mt-2">Son hareketler yakında burada.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
