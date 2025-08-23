// client/src/pages/Warehouses.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RoleGate from "../components/RoleGate.jsx";

const LS_KEY = "wh_list";

export default function Warehouses(){
  const nav = useNavigate();
  const [rows, setRows] = useState([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ kod:"", ad:"", etkilesin:true });

  const persist = (arr) => { setRows(arr); localStorage.setItem(LS_KEY, JSON.stringify(arr)); };

  useEffect(()=>{
    const saved = localStorage.getItem(LS_KEY);
    if (saved) { try { setRows(JSON.parse(saved)); return; } catch {} }
    const seed = [
      { kod:"MRZ", ad:"Merkez Depo", etkilesin:true },
      { kod:"ANK", ad:"Ankara Depo", etkilesin:true },
      { kod:"IZM", ad:"İzmir Depo",  etkilesin:false },
    ];
    persist(seed);
  },[]);

  const submit = (e) => {
    e.preventDefault();
    const kod = form.kod.trim().toUpperCase();
    const ad  = form.ad.trim();
    if (!kod || !ad) return;
    if (rows.some(r=>r.kod===kod)) return alert("Bu kod zaten var.");
    persist([{ kod, ad, etkilesin: !!form.etkilesin }, ...rows]);
    setShow(false); setForm({ kod:"", ad:"", etkilesin:true });
  };

  const del = (kod, ad) => {
    if (!confirm(`${ad} silinsin mi?`)) return;
    persist(rows.filter(x=>x.kod!==kod));
  };

  return (
    <div className="bg-white rounded-2xl shadow p-3 p-md-4">
      <div className="d-flex align-items-center justify-content-between">
        <h5 className="mb-0">Depolar</h5>
        <RoleGate allow={["yönetici","depocu"]}>
          <button className="btn btn-primary" onClick={()=>setShow(true)}>+ Yeni Depo</button>
        </RoleGate>
      </div>

      <div className="table-responsive mt-3">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr><th>Kod</th><th>Ad</th><th>Genel Stoğu Etkilesin mi?</th><th style={{width:120}}></th></tr>
          </thead>
          <tbody>
            {rows.length===0 ? <tr><td colSpan={4} className="text-muted py-4">Kayıt yok.</td></tr> :
              rows.map(r=>(
                <tr key={r.kod} style={{cursor:"pointer"}} onClick={()=>nav(`/depo/${r.kod}`)} title="Depo detayına git">
                  <td className="fw-semibold">{r.kod}</td>
                  <td>{r.ad}</td>
                  <td>{r.etkilesin ? "Evet" : "Hayır"}</td>
                  <td onClick={(e)=>e.stopPropagation()}>
                    <RoleGate allow={["yönetici"]}>
                      <button className="btn btn-sm btn-outline-danger" onClick={()=>del(r.kod, r.ad)}>Sil</button>
                    </RoleGate>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {show && (
        <div className="modal d-block" tabIndex="-1" style={{background:"rgba(0,0,0,.4)"}}>
          <div className="modal-dialog">
            <form className="modal-content" onSubmit={submit}>
              <div className="modal-header">
                <h5 className="modal-title">Yeni Depo</h5>
                <button type="button" className="btn-close" onClick={()=>setShow(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-2">
                  <div className="col-md-4">
                    <label className="form-label">Kod</label>
                    <input className="form-control" value={form.kod} onChange={e=>setForm({...form,kod:e.target.value.toUpperCase()})} required />
                  </div>
                  <div className="col-md-8">
                    <label className="form-label">Ad</label>
                    <input className="form-control" value={form.ad} onChange={e=>setForm({...form,ad:e.target.value})} required />
                  </div>
                  <div className="col-12">
                    <RoleGate allow={["yönetici"]} fallback={<div className="form-text text-muted">Bu ayarı yalnızca yöneticiler değiştirebilir.</div>}>
                      <div className="form-check">
                        <input id="etkilesin" className="form-check-input" type="checkbox"
                          checked={form.etkilesin} onChange={e=>setForm({...form, etkilesin:e.target.checked})}/>
                        <label htmlFor="etkilesin" className="form-check-label">Genel stoğu etkilesin mi?</label>
                      </div>
                    </RoleGate>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-link" onClick={()=>setShow(false)}>Vazgeç</button>
                <button className="btn btn-primary">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
