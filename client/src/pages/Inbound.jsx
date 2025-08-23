import React, { useEffect, useState } from "react";

const WH_LS_KEY = "wh_list";
const readWarehouses = () => {
  try { const a = JSON.parse(localStorage.getItem(WH_LS_KEY)||"[]"); return Array.isArray(a)?a:[]; } catch { return []; }
};

export default function Inbound(){
  const [whs, setWhs] = useState(readWarehouses());
  const [form, setForm] = useState({ tarih: new Date().toISOString().slice(0,10), depo:"", aciklama:"" });
  const [lines, setLines] = useState([{ kod:"", ad:"", miktar:"" }]);

  useEffect(()=>{
    const h = (e)=>{ if (e.key===WH_LS_KEY) setWhs(readWarehouses()); };
    window.addEventListener("storage", h); return ()=>window.removeEventListener("storage", h);
  },[]);

  const addLine   = ()=> setLines([...lines, { kod:"", ad:"", miktar:"" }]);
  const delLine   = (i)=> setLines(lines.filter((_,idx)=>idx!==i));
  const chLine    = (i,k,v)=> setLines(lines.map((r,idx)=> idx===i? {...r,[k]:v}:r));

  const submit = (e) => {
    e.preventDefault();
    // TODO: backend POST /inbound { ...form, lines }
    alert("Giriş kaydedildi (demo).");
    setForm({ tarih: new Date().toISOString().slice(0,10), depo:"", aciklama:"" });
    setLines([{ kod:"", ad:"", miktar:"" }]);
  };

  return (
    <div className="bg-white rounded-2xl shadow p-3 p-md-4">
      <h5>Gelen Ürünler</h5>
      <form className="mt-3" onSubmit={submit}>
        <div className="row g-2">
          <div className="col-md-3">
            <label className="form-label">Tarih</label>
            <input type="date" className="form-control" value={form.tarih} onChange={e=>setForm({...form,tarih:e.target.value})} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Depo</label>
            <select className="form-select" value={form.depo} onChange={e=>setForm({...form,depo:e.target.value})} required>
              <option value="">Seçin…</option>
              {whs.map(w=> <option key={w.kod} value={w.kod}>{w.kod} – {w.ad}</option>)}
            </select>
          </div>
          <div className="col-md-5">
            <label className="form-label">Açıklama</label>
            <input className="form-control" value={form.aciklama} onChange={e=>setForm({...form,aciklama:e.target.value})}/>
          </div>
        </div>

        <div className="table-responsive mt-3">
          <table className="table table-sm align-middle">
            <thead className="table-light"><tr><th style={{width:160}}>Stok Kodu</th><th>Ürün Adı</th><th style={{width:160}}>Miktar</th><th style={{width:1}}></th></tr></thead>
            <tbody>
              {lines.map((ln,i)=>(
                <tr key={i}>
                  <td><input className="form-control" value={ln.kod} onChange={e=>chLine(i,"kod",e.target.value)} /></td>
                  <td><input className="form-control" value={ln.ad}  onChange={e=>chLine(i,"ad", e.target.value)} /></td>
                  <td><input type="number" className="form-control" value={ln.miktar} onChange={e=>chLine(i,"miktar",e.target.value)} /></td>
                  <td><button type="button" className="btn btn-outline-danger btn-sm" onClick={()=>delLine(i)}>Sil</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="d-flex gap-2">
          <button type="button" className="btn btn-outline-secondary" onClick={addLine}>+ Satır</button>
          <button className="btn btn-primary">Kaydet</button>
        </div>
      </form>
    </div>
  );
}
