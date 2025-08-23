import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import RoleGate from "../components/RoleGate.jsx";

const WH_LS_KEY = "wh_list";
const ORDER_LS_KEY = "depoOrder";
const PINNED = "Genel Stok";

/* ---------- Helpers ---------- */

// Depo adlarını LS'den oku (bozuk kayıtları yut)
function readDepotNamesFromLS() {
  try {
    const raw = localStorage.getItem(WH_LS_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    // sadece doğru objelerden ad çek
    return list
      .map((w) => (w && typeof w.ad === "string" ? w.ad : null))
      .filter(Boolean);
  } catch {
    return [];
  }
}

// Sütun sırasını LS'den oku, bozuksa onar
function readOrderFromLS(initial) {
  try {
    const raw = localStorage.getItem(ORDER_LS_KEY);
    if (!raw) return initial;
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return initial;
    return arr;
  } catch {
    return initial;
  }
}

// Benzersiz dizi
const uniq = (arr) => Array.from(new Set(arr));

/* ---------- Component ---------- */

export default function Products() {
  const nav = useNavigate();
  const [sp] = useSearchParams();

  const queryParam = sp.get("query") || "";
  const [q, setQ] = useState(queryParam);

  // Depoları oku -> ["Genel Stok", ...depolar]
  const [depots, setDepots] = useState(() => [PINNED, ...readDepotNamesFromLS()]);

  // Sütun sırası (bozuksa otomatik toparla)
  const [order, setOrder] = useState(() =>
    readOrderFromLS([PINNED, ...readDepotNamesFromLS()])
  );

  // Order'ı normalize et: PINNED başta, kopyasız, sadece mevcut depolar
  const normalizeOrder = (baseOrder, currentDepots) => {
    const depSet = new Set(currentDepots);
    const others = baseOrder.filter((x) => x !== PINNED && depSet.has(x));
    // yeni eklenen depoları sona ekle
    for (const d of currentDepots) {
      if (d !== PINNED && !others.includes(d)) others.push(d);
    }
    return [PINNED, ...uniq(others)];
  };

  // Depolar LS'de değiştiğinde ekrana yansıt
  useEffect(() => {
    const syncFromLS = () => {
      const current = [PINNED, ...readDepotNamesFromLS()];
      setDepots(current);
      setOrder((prev) => normalizeOrder(Array.isArray(prev) ? prev : [], current));
    };
    // ilk yükleme
    syncFromLS();
    // başka sekmeden değişiklik olursa
    const onStorage = (e) => {
      if (e.key === WH_LS_KEY) syncFromLS();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Order her değiştiğinde LS'ye yaz (önce normalize et)
  useEffect(() => {
    const safe = normalizeOrder(Array.isArray(order) ? order : [], depots);
    if (JSON.stringify(safe) !== JSON.stringify(order)) {
      setOrder(safe); // ekranı da düzelt
      return; // yazmayı bir sonraki effect'e bırak
    }
    try {
      localStorage.setItem(ORDER_LS_KEY, JSON.stringify(safe));
    } catch {}
  }, [order, depots]);

  // DEMO veri (backend bağlanana kadar)
  const [rows] = useState(() => [
    { kod: "KAB-001", ad: "Kablo 2x1.5", stok: { [PINNED]: 120, Merkez: 80, Ankara: 20, İzmir: 20 } },
    { kod: "SIG-010", ad: "Sigorta 10A", stok: { [PINNED]: 35, Merkez: 15, Ankara: 10, İzmir: 10 } },
    { kod: "ROLE-24", ad: "Röle 24V", stok: { [PINNED]: 12, Merkez: 3, Ankara: 5, İzmir: 4 } },
  ]);

  // Arama kutusunu URL'den gelenle senkronla
  useEffect(() => setQ(queryParam), [queryParam]);

  // Filtreli liste (guard'lı)
  const filtered = useMemo(() => {
    try {
      const s = (q || "").toString().trim().toLowerCase();
      if (!s) return rows;
      return rows.filter((r) => {
        const kod = (r?.kod || "").toString().toLowerCase();
        const ad = (r?.ad || "").toString().toLowerCase();
        return kod.includes(s) || ad.includes(s);
      });
    } catch {
      return rows;
    }
  }, [rows, q]);

  // Drag & drop (PINNED sabit)
  const onDragStart = (e, name) => {
    try {
      e.dataTransfer.setData("text/plain", name);
    } catch {}
  };

  const onDrop = (e, over) => {
    let name = "";
    try {
      name = e.dataTransfer.getData("text/plain");
    } catch {}
    if (!name || name === over || name === PINNED || over === PINNED) return;

    const from = order.indexOf(name);
    const to = order.indexOf(over);
    if (from < 0 || to < 0) return;

    const arr = [...order];
    arr.splice(from, 1);
    arr.splice(to, 0, name);
    setOrder(arr);
  };

  // Renderlanacak başlıklar: sadece mevcut depolar
  const headers = normalizeOrder(order, depots).filter((d) => depots.includes(d));

  return (
    <div className="bg-white rounded-2xl shadow p-3 p-md-4">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2">
        <h5 className="mb-0">Ürünler</h5>
        <div className="d-flex gap-2">
          <input
            className="form-control"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ara: kod / ad / barkod"
          />
          <RoleGate allow={["yönetici","depocu"]}>
            <button className="btn btn-primary" onClick={() => nav("/urun/yeni")}>
              + Yeni Ürün
            </button>
          </RoleGate>
        </div>
      </div>

      <div className="small text-muted mt-2">
        {PINNED} sabittir. Diğer depo sütunlarını sürükleyerek sıralayabilirsiniz.
      </div>

      <div className="table-responsive mt-2">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Stok Kodu</th>
              <th>Ürün Adı</th>
              {headers.map((h) => (
                <th
                  key={h}
                  draggable={h !== PINNED}
                  onDragStart={(e) => h !== PINNED && onDragStart(e, h)}
                  onDragOver={(e) => h !== PINNED && e.preventDefault()}
                  onDrop={(e) => h !== PINNED && onDrop(e, h)}
                  title={h === PINNED ? "Sabit sütun" : "Sürükleyin"}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={2 + headers.length} className="text-muted py-4">
                  Sonuç bulunamadı.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr
                  key={r?.kod || Math.random()}
                  style={{ cursor: "pointer" }}
                  onClick={() => nav(`/urun/${encodeURIComponent(r?.kod || "")}`)}
                >
                  <td className="fw-semibold">{r?.kod || "-"}</td>
                  <td>{r?.ad || "-"}</td>
                  {headers.map((h) => (
                    <td key={h}>{(r?.stok && r.stok[h]) ?? 0}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
