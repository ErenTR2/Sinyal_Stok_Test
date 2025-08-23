import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RoleGate from "../components/RoleGate.jsx";

export default function Dashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const [summary, setSummary] = useState({
    toplamStokKalemi: 352,
    kritikStokSayisi: 12,
    son7GunHareket: 148,
  });

  const [kritikStoklar, setKritikStoklar] = useState([]);
  const [hareketler, setHareketler] = useState([]);

  useEffect(() => {
    setKritikStoklar([
      { kod: "KAB-001", ad: "Kablo 2x1.5", depo: "Merkez", miktar: 4, kritikSeviye: 10 },
      { kod: "SIG-010", ad: "Sigorta 10A", depo: "Merkez", miktar: 2, kritikSeviye: 8 },
      { kod: "ROLE-24", ad: "Röle 24V", depo: "Ankara", miktar: 5, kritikSeviye: 12 },
      { kod: "LMB-220", ad: "Lamba 220V", depo: "İzmir", miktar: 1, kritikSeviye: 6 },
    ]);
    setHareketler([
      { id: 1, tarih: "2025-08-16 10:12", tip: "Giriş",    stokKod: "KAB-001", miktar: 100, depo: "Merkez", aciklama: "Satın alma #PO-987" },
      { id: 2, tarih: "2025-08-16 09:30", tip: "Çıkış",    stokKod: "SIG-010", miktar: 6,   depo: "Merkez", aciklama: "Bakım siparişi #WO-423" },
      { id: 3, tarih: "2025-08-15 15:48", tip: "Sayım",    stokKod: "ROLE-24", miktar: -2,  depo: "Ankara", aciklama: "Sayım farkı düzeltme" },
      { id: 4, tarih: "2025-08-15 11:02", tip: "Transfer", stokKod: "LMB-220", miktar: 10,  depo: "İzmir → Merkez", aciklama: "Depolar arası transfer" },
    ]);
  }, []);

  const go = (p) => navigate(p);
  const doSearch = (e) => { if (e.key === "Enter" && search.trim()) navigate(`/urunler?query=${encodeURIComponent(search.trim())}`); };

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3">
        <div className="flex-grow-1">
          <input className="form-control form-control-lg rounded-3"
            placeholder="Ürün, stok kodu veya barkod ara…"
            value={search} onChange={(e)=>setSearch(e.target.value)} onKeyDown={doSearch}/>
        </div>
        <div className="d-flex gap-2">
          <RoleGate allow={["yönetici","depocu"]}>
            <button className="btn btn-primary" onClick={() => go("/gelen")}>Gelen Ürünler</button>
          </RoleGate>
          <RoleGate allow={["yönetici","depocu"]}>
            <button className="btn btn-outline-secondary" onClick={() => go("/giden")}>Giden Ürünler</button>
          </RoleGate>
        </div>
      </div>

      <div className="row g-3 mb-3">
        <Kpi title="Toplam Stok Kalemi" value={summary.toplamStokKalemi} onClick={()=>go("/urunler")} />
        <Kpi title="Kritik Stok" value={summary.kritikStokSayisi} warn onClick={()=>go("/rapor/kritik-stok")} />
        <Kpi title="Son 7 Gün Hareket" value={summary.son7GunHareket} onClick={()=>go("/hareketler")} />
      </div>

      <div className="row g-2">
        <RoleGate allow={["yönetici","depocu"]}>
          <div className="col-12 col-sm-6">
            <button className="btn btn-outline-secondary w-100" onClick={()=>go("/stok-guncelle")}>
              Stok Güncelleme
            </button>
          </div>
        </RoleGate>
        <RoleGate allow={["yönetici","depocu"]}>
          <div className="col-12">
            <button className="btn btn-outline-secondary w-100" onClick={()=>go("/transfer")}>
              Depolar Arası Transfer
            </button>
          </div>
        </RoleGate>
      </div>
      
      <div className="row g-3 mb-3">
        <div className="col-xl-4">
          <div className="card shadow-sm rounded-4">
            <div className="card-body">
              <div className="fw-semibold mb-2">Hızlı İşlemler</div>
                <RoleGate allow={["yönetici","depocu"]}>
                  <div className="col-12 col-sm-6">
                    <button className="btn btn-outline-secondary w-100" onClick={()=>go("/stok-guncelle")}>Stok Güncelleme</button>
                  </div>
                </RoleGate>
                <div className="col-12 col-sm-6">
                  <button className="btn btn-outline-secondary w-100" onClick={()=>go("/depolar")}>Depolar</button>
                </div>
                <RoleGate allow={["yönetici","depocu"]}>
                  <div className="col-12">
                    <button className="btn btn-outline-secondary w-100" onClick={()=>go("/transfer")}>Depolar Arası Transfer</button>
                  </div>
                </RoleGate>

              <hr className="my-3" />
              <div className="text-muted small mb-2">Raporlar</div>
              <div className="d-flex flex-column gap-1">
                <button className="btn btn-link text-start" onClick={()=>go("/rapor/hareket/gunluk")}>Günlük Hareket Raporu</button>
                <button className="btn btn-link text-start" onClick={()=>go("/rapor/kritik-stok")}>Kritik Stok Raporu</button>
                <button className="btn btn-link text-start" onClick={()=>go("/rapor/envanter")}>Depo Bazlı Envanter</button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-8">
          <div className="card shadow-sm rounded-4">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div className="fw-semibold">Kritik Stoklar</div>
                <button className="btn btn-link" onClick={() => go("/rapor/kritik-stok")}>Tümünü Gör</button>
              </div>

              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr onClick={()=>navigate(`/urun/${encodeURIComponent(row.kod)}`)} style={{cursor:"pointer"}}>
                      <td>{row.kod}</td>
                      <td>{row.ad}</td>
                    </tr>
                    <tr>
                      <th>Stok Kodu</th><th>Ürün Adı</th><th>Depo</th>
                      <th>Miktar</th><th>Kritik Seviye</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kritikStoklar.length === 0 ? (
                      <tr><td colSpan={5} className="text-muted py-4">Kritik stok bulunmuyor.</td></tr>
                    ) : kritikStoklar.map(r=>(
                      <tr key={r.kod} onClick={()=>go(`/urun/${encodeURIComponent(r.kod)}`)} style={{cursor:"pointer"}}>
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
          </div>
        </div>
      </div>

      <div className="card shadow-sm rounded-4">
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-between">
            <div className="fw-semibold">Son Hareketler</div>
            <button className="btn btn-link" onClick={() => go("/hareketler")}>Tümünü Gör</button>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr><th>Tarih</th><th>Tip</th><th>Stok Kodu</th><th>Miktar</th><th>Depo</th><th>Açıklama</th></tr>
              </thead>
              <tbody>
                {hareketler.length === 0 ? (
                  <tr><td colSpan={6} className="text-muted py-4">Kayıt bulunamadı.</td></tr>
                ) : hareketler.map(h=>(
                  <tr key={h.id}>
                    <td className="text-nowrap">{h.tarih}</td>
                    <td><Badge type={h.tip}/></td>
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
      </div>
    </div>
  );
}

function Kpi({ title, value, warn, onClick }) {
  return (
    <div className="col-12 col-sm-6 col-xl-4">
      <div
        className={"card shadow-sm rounded-4 " + (warn ? "border-danger-subtle" : "")}
        style={{cursor:"pointer"}}
        onClick={onClick}
        title="Detaya git"
      >
        <div className="card-body">
          <div className="text-muted">{title}</div>
          <div className={"fs-3 fw-semibold " + (warn ? "text-danger" : "")}>{value}</div>
        </div>
      </div>
    </div>
  );
}
function Badge({ type }) {
  const cls = {
    "Giriş": "badge bg-success-subtle text-success-emphasis",
    "Çıkış": "badge bg-danger-subtle text-danger-emphasis",
    "Transfer": "badge bg-primary-subtle text-primary-emphasis",
    "Sayım": "badge bg-warning-subtle text-warning-emphasis",
  }[type] || "badge bg-secondary-subtle text-secondary-emphasis";
  return <span className={cls}>{type}</span>;
}
