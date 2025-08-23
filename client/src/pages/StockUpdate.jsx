import React, { useEffect, useMemo, useState } from "react";

export default function StockUpdate(){
  const [q, setQ] = useState("");
  const [urunler, setUrunler] = useState([]);
  const [secili, setSecili] = useState(null);
  const [mode, setMode] = useState("yeni"); // yeni | artir | azalt
  const [val, setVal] = useState("");

  useEffect(()=>{
    setUrunler([
      { kod:"KAB-001", ad:"Kablo 2x1.5", genel:120 },
      { kod:"SIG-010", ad:"Sigorta 10A", genel:35 },
      { kod:"ROLE-24", ad:"Röle 24V", genel:12 },
    ]);
  },[]);

  const filtered = useMemo(()=>{
    const s = q.trim().toLowerCase();
    if(!s) return urunler;
    return urunler.filter(u=>u.kod.toLowerCase().includes(s)||u.ad.toLowerCase().includes(s));
  },[urunler,q]);

  const pick = (u) => { setSecili(u); setVal(""); };
  const submit = (e) => {
    e.preventDefault();
    if(!secili) return;
    const n = Number(val);
    if(isNaN(n)) return;

    // TODO: backend'e gönder /logs
    // mode === "yeni" -> stok = n
    // mode === "artir" -> stok += n
    // mode === "azalt" -> stok -= n
    alert(`Güncellendi: ${secili.kod} (${mode} ${n})`);
    setVal("");
  };

  return (
    <div className="bg-white rounded-2xl shadow p-3 p-md-4">
      <h5>Stok Güncelleme</h5>

      <div className="row g-3 mt-1">
        <div className="col-md-6">
          <label className="form-label">Ürün ara</label>
          <input className="form-control" value={q} onChange={e=>setQ(e.target.value)} placeholder="Kod / Ad..." />
          <div className="list-group mt-2">
            {filtered.slice(0,7).map(u=>(
              <button key={u.kod} className={"list-group-item list-group-item-action d-flex justify-content-between "+(secili?.kod===u.kod?"active":"")}
                onClick={()=>pick(u)}>
                <span>{u.kod} – {u.ad}</span>
                <span className="badge text-bg-secondary">Genel: {u.genel}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="col-md-6">
          <label className="form-label">Güncelle</label>
          <form onSubmit={submit}>
            <div className="btn-group mb-2">
              <button type="button" className={"btn btn-sm "+(mode==="yeni"?"btn-dark":"btn-outline-secondary")} onClick={()=>setMode("yeni")}>Yeni Stok</button>
              <button type="button" className={"btn btn-sm "+(mode==="artir"?"btn-dark":"btn-outline-secondary")} onClick={()=>setMode("artir")}>Artır</button>
              <button type="button" className={"btn btn-sm "+(mode==="azalt"?"btn-dark":"btn-outline-secondary")} onClick={()=>setMode("azalt")}>Azalt</button>
            </div>
            <input className="form-control" disabled={!secili} value={val} onChange={e=>setVal(e.target.value)} placeholder={mode==="yeni"?"Yeni stok adedi":"Miktar"} />
            <button className="btn btn-primary mt-2" disabled={!secili || val===""}>Kaydet</button>
          </form>
          {!secili && <div className="form-text mt-2">Soldan bir ürün seçin.</div>}
        </div>
      </div>
    </div>
  );
}
