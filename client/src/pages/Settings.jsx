import React, { useEffect, useState } from "react";

const WH_LS_KEY = "wh_list";

export default function Settings(){
  const [tab, setTab] = useState("general");
  return (
    <div className="bg-white rounded-2xl shadow p-3 p-md-4">
      <h5>Ayarlar</h5>
      <div className="btn-group mt-2">
        <button className={"btn btn-sm "+(tab==="general"?"btn-dark":"btn-outline-secondary")} onClick={()=>setTab("general")}>Genel</button>
        <button className={"btn btn-sm "+(tab==="warehouses"?"btn-dark":"btn-outline-secondary")} onClick={()=>setTab("warehouses")}>Depo Ayarları</button>
        <button className={"btn btn-sm "+(tab==="users"?"btn-dark":"btn-outline-secondary")} onClick={()=>setTab("users")}>Kullanıcılar</button>
      </div>

      {tab==="general" && <GeneralTab/>}
      {tab==="warehouses" && <WarehouseTab/>}
      {tab==="users" && <UsersTab/>}
    </div>
  );
}

function GeneralTab(){
  return (
    <div className="mt-3">
      <div className="alert alert-info">Genel ayarlar yakında burada olacak.</div>
    </div>
  );
}

function WarehouseTab(){
  const [rows, setRows] = useState([]);

  useEffect(()=>{
    try {
      const raw = localStorage.getItem(WH_LS_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      if (Array.isArray(arr)) setRows(arr);
    } catch {}
  },[]);

  const toggle = (kod) => {
    const upd = rows.map(r => r.kod===kod ? { ...r, etkilesin: !r.etkilesin } : r);
    setRows(upd);
    try { localStorage.setItem(WH_LS_KEY, JSON.stringify(upd)); } catch {}
  };

  if (rows.length===0) {
    return <div className="mt-3 text-muted">Depo bulunamadı.</div>;
  }

  return (
    <div className="table-responsive mt-3">
      <table className="table align-middle">
        <thead className="table-light">
          <tr><th>Kod</th><th>Ad</th><th>Genel stoğu etkilesin mi?</th></tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.kod}>
              <td className="fw-semibold">{r.kod}</td>
              <td>{r.ad}</td>
              <td>
                <input type="checkbox" className="form-check-input" checked={!!r.etkilesin} onChange={()=>toggle(r.kod)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UsersTab(){
  return (
    <div className="mt-3">
      <div className="alert alert-info">Kullanıcı yönetimi yakında...</div>
    </div>
  );
}
