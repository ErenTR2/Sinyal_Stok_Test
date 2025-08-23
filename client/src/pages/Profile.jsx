// client/src/pages/Profile.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import RoleGate from "../components/RoleGate.jsx";
import { useNavigate } from "react-router-dom";

const WH_LS_KEY = "wh_list";

function readWarehouses() {
  try {
    const raw = localStorage.getItem(WH_LS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(arr)) return [];
    return arr.filter(w=>w && typeof w.kod==="string" && typeof w.ad==="string");
  } catch { return []; }
}

// file -> dataURL
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

export default function Profile(){
  const navigate = useNavigate();

  // client/src/pages/Profile.jsx (state'ler)
  const [fullName, setFullName] = useState(sessionStorage.getItem("fullName") || "");
  const [email] = useState(sessionStorage.getItem("email") || "");
  const role = (sessionStorage.getItem("role") || "kullanıcı");
  const [avatar, setAvatar] = useState(localStorage.getItem("avatar") || "https://i.pravatar.cc/160");


  // sorumlu depo
  const [warehouses, setWarehouses] = useState(readWarehouses());
  const [responsible, setResponsible] = useState(sessionStorage.getItem("responsibleWh") || "YOK");

  // şifre değiştir (2 adım)
  const [cur, setCur] = useState("");
  const [n1, setN1] = useState("");
  const [n2, setN2] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | await_code
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // -------- Avatar Editor (zoom + drag) --------
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorSrc, setEditorSrc] = useState(null);
  const [scale, setScale] = useState(1); // 1 - 3
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragRef = useRef(null);
  const dragState = useRef({ dragging:false, ox:0, oy:0, sx:0, sy:0 });

  const openEditorWith = async (file) => {
    if (!file) return;
    if (!/^image\//.test(file.type)) { setErr("Lütfen bir resim dosyası seçin."); return; }
    if (file.size > 4 * 1024 * 1024) { setErr("Maksimum 4 MB yükleyin."); return; }
    const dataUrl = await fileToDataUrl(file);
    setEditorSrc(dataUrl);
    setScale(1);
    setPos({x:0, y:0});
    setEditorOpen(true);
    setErr("");
  };

  const onMouseDown = (e) => {
    dragState.current = { dragging:true, ox:e.clientX, oy:e.clientY, sx:pos.x, sy:pos.y };
  };
  const onMouseMove = (e) => {
    if (!dragState.current.dragging) return;
    const dx = e.clientX - dragState.current.ox;
    const dy = e.clientY - dragState.current.oy;
    setPos({ x: dragState.current.sx + dx, y: dragState.current.sy + dy });
  };
  const onMouseUp = () => { dragState.current.dragging = false; };

  // kırp & kaydet
  const saveCropped = () => {
    const size = 320;
    const canvas = document.createElement("canvas");
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // beyaz zemin
      ctx.fillStyle = "#fff";
      ctx.fillRect(0,0,size,size);

      // daire clip
      ctx.save();
      ctx.beginPath();
      ctx.arc(size/2, size/2, size/2, 0, Math.PI*2);
      ctx.closePath();
      ctx.clip();

      // merkeze konumla + ölçek uygula
      ctx.setTransform(scale, 0, 0, scale, size/2 + pos.x, size/2 + pos.y);
      ctx.translate(-img.width/2, -img.height/2);
      ctx.drawImage(img, 0, 0);

      ctx.restore();

      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      setAvatar(dataUrl);
      localStorage.setItem("avatar", dataUrl);
      setEditorOpen(false);
      setMsg("Profil fotoğrafı güncellendi.");
    };
    img.onerror = () => setErr("Görsel işlenemedi.");
    img.src = editorSrc;
  };


  // depolar
  useEffect(()=> {
    const handler = (e) => { if (e.key === WH_LS_KEY) setWarehouses(readWarehouses()); };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const responsibleName = useMemo(()=>{
    if (responsible==="YOK") return "YOK";
    const f = warehouses.find(w=>w.kod===responsible);
    return f ? `${f.kod} – ${f.ad}` : "YOK";
  },[responsible, warehouses]);

  const saveProfile = async (e) => {
    e.preventDefault();
    sessionStorage.setItem("fullName", fullName);
    sessionStorage.setItem("avatar", avatar);
    sessionStorage.setItem("responsibleWh", responsible);
    setMsg("Profil güncellendi.");
    setErr("");
    // TODO: backend PATCH /me
  };

  const requestChange = async (e) => {
    e.preventDefault();
    setMsg(""); setErr("");
    if (!cur || !n1 || !n2) return setErr("Tüm alanları doldurun.");
    if (n1 !== n2) return setErr("Yeni şifreler aynı olmalı.");
    try {
      setLoading(true);
      await api.post("/auth/change-password/request", { current: cur, email });
      setPhase("await_code");
      setMsg("E-posta doğrulama kodu gönderildi.");
    } catch (e2) {
      setErr(e2?.response?.data?.error || "İstek gönderilemedi.");
    } finally {
      setLoading(false);
    }
  };

  const confirmChange = async (e) => {
    e.preventDefault();
    setMsg(""); setErr("");
    if (!code || code.length < 4) return setErr("Doğrulama kodunu girin.");
    try {
      setLoading(true);
      await api.post("/auth/change-password/confirm", { email, code, newPassword: n1 });
      setPhase("idle");
      setCur(""); setN1(""); setN2(""); setCode("");
      setMsg("Şifre değiştirildi.");
    } catch (e2) {
      setErr(e2?.response?.data?.error || "Kod doğrulanamadı.");
    } finally {
      setLoading(false);
    }
  };

  // çıkış
  const logout = () => {
    sessionStorage.clear();
    navigate("/giris");
  };

  const isAdmin = role.toLowerCase()==="yönetici";

  return (
    <div className="bg-white rounded-2xl shadow p-3 p-md-4">
      <div className="d-flex align-items-center justify-content-between">
        <h5 className="mb-0">Profil</h5>
        <button className="btn btn-outline-danger btn-sm" onClick={logout}>Çıkış Yap</button>
      </div>

      {/* Profil kartı */}
      <form className="mt-3" onSubmit={saveProfile}>
        <div className="row g-3">
          <div className="col-md-3 d-flex flex-column align-items-center">
            <div className="avatar-ring">
              <img src={avatar} alt="pp" width={128} height={128} style={{borderRadius:"50%", objectFit:"cover"}} />
            </div>
            <label className="btn btn-outline-secondary btn-sm mt-2">
              Fotoğraf Yükle
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e)=>openEditorWith(e.target.files?.[0])}
              />
            </label>
          </div>

          <div className="col-md-9">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Ad Soyad</label>
                <input className="form-control" value={fullName} onChange={e=>setFullName(e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">E-posta</label>
                <input className="form-control" value={email} disabled />
              </div>
              <div className="col-md-6">
                <label className="form-label">Rol</label>
                <input className="form-control" value={role} disabled />
              </div>
              <div className="col-md-6">
                <label className="form-label">Sorumlu Olduğu Depo</label>
                <div className="d-flex gap-2">
                  <input className="form-control" value={responsibleName} disabled />
                  <RoleGate allow={["yönetici"]}>
                    <select
                      className="form-select"
                      value={responsible}
                      onChange={(e)=>setResponsible(e.target.value)}
                      title="Sadece yönetici değiştirebilir"
                    >
                      <option value="YOK">YOK</option>
                      {warehouses.map(w=>(
                        <option key={w.kod} value={w.kod}>{w.kod} – {w.ad}</option>
                      ))}
                    </select>
                  </RoleGate>
                </div>
                {!isAdmin && <div className="form-text">Bu alanı yönetici güncelleyebilir.</div>}
              </div>
            </div>
            <button className="btn btn-primary mt-3">Kaydet</button>
          </div>
        </div>
      </form>

      <hr className="my-4" />

      {/* Şifre Değiştir */}
      <h6>Şifre Değiştir</h6>
      {phase==="idle" ? (
        <form className="row g-2" onSubmit={requestChange} style={{maxWidth:620}}>
          <div className="col-12">
            <input type="password" className="form-control" placeholder="Mevcut şifre" value={cur} onChange={e=>setCur(e.target.value)} />
          </div>
          <div className="col-md-6">
            <input type="password" className="form-control" placeholder="Yeni şifre" value={n1} onChange={e=>setN1(e.target.value)} />
          </div>
          <div className="col-md-6">
            <input type="password" className="form-control" placeholder="Yeni şifre (tekrar)" value={n2} onChange={e=>setN2(e.target.value)} />
          </div>
          {err && <div className="col-12"><div className="alert alert-danger py-2">{err}</div></div>}
          {msg && <div className="col-12"><div className="alert alert-success py-2">{msg}</div></div>}
          <div className="col-12">
            <button className="btn btn-outline-secondary" disabled={loading}>
              {loading ? "Gönderiliyor..." : "Doğrulama Kodunu Gönder"}
            </button>
          </div>
        </form>
      ) : (
        <form className="row g-2" onSubmit={confirmChange} style={{maxWidth:520}}>
          <div className="col-12">
            <input className="form-control" placeholder="E-postaya gelen doğrulama kodu" value={code} onChange={e=>setCode(e.target.value)} />
          </div>
          {err && <div className="col-12"><div className="alert alert-danger py-2">{err}</div></div>}
          {msg && <div className="col-12"><div className="alert alert-success py-2">{msg}</div></div>}
          <div className="col-12 d-flex gap-2">
            <button className="btn btn-secondary" type="button" onClick={()=>{setPhase("idle"); setCode(""); setMsg(""); setErr("");}}>Geri</button>
            <button className="btn btn-primary" disabled={loading}>
              {loading ? "Onaylanıyor..." : "Şifreyi Değiştir"}
            </button>
          </div>
        </form>
      )}

      {/* Avatar Editor Modal */}
      {editorOpen && (
        <div className="modal d-block" tabIndex="-1" style={{background:"rgba(0,0,0,.45)"}} onMouseUp={onMouseUp}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h6 className="modal-title">Fotoğrafı Ayarla</h6>
                <button className="btn-close" onClick={()=>setEditorOpen(false)} />
              </div>
              <div className="modal-body">
                <div
                  ref={dragRef}
                  className="avatar-editor"
                  onMouseDown={onMouseDown}
                  onMouseMove={onMouseMove}
                >
                  {editorSrc && (
                    <img
                      src={editorSrc}
                      alt="edit"
                      style={{
                        transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
                      }}
                    />
                  )}
                  <div className="avatar-mask"></div>
                </div>
                <input
                  type="range"
                  min="1" max="3" step="0.01"
                  className="form-range mt-3"
                  value={scale}
                  onChange={(e)=>setScale(parseFloat(e.target.value))}
                />
                <div className="form-text">Fotoğrafı sürükleyin, yakınlaştırın.</div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-link" onClick={()=>setEditorOpen(false)}>Vazgeç</button>
                <button className="btn btn-primary" onClick={saveCropped}>Kaydet</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* mesajlar */}
      {(msg || err) && <div className="mt-3">
        {msg && <div className="alert alert-success py-2">{msg}</div>}
        {err && <div className="alert alert-danger  py-2">{err}</div>}
      </div>}
    </div>
  );
}
