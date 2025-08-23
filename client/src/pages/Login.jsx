import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Login() {
  const nav = useNavigate();
  const [emailLocal, setEmailLocal] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      setLoading(true);
      const email = emailLocal.includes("@")
        ? emailLocal.trim()
        : `${emailLocal.trim()}@sinyalizasyon.com`;

      const { data } = await api.post("/auth/login", { email, password });

      // ⬇️  BURASI ÖNEMLİ: oturum verilerini dolduruyoruz
      // client/src/pages/Login.jsx  (başarılı giriş sonrası)
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("email", data.user?.email || email);
      sessionStorage.setItem("fullName", data.user?.username || "");
      sessionStorage.setItem("role", (data.user?.role || "kullanıcı").toLowerCase());
      if (data.user?.responsibleWh) {
        sessionStorage.setItem("responsibleWh", data.user.responsibleWh);
      }
// avatar kalıcı olsun:
      if (data.user?.avatar) localStorage.setItem("avatar", data.user.avatar);

      nav("/dashboard");
    } catch (e) {
      setErr(e.response?.data?.error || "Giriş başarısız.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-5">
          <h3 className="mb-3">Giriş</h3>
          <form onSubmit={onSubmit} className="card card-body">
            <div className="mb-3">
              <label className="form-label">E-posta</label>
              <div className="input-group">
                <input className="form-control" placeholder="ad.soyad"
                       value={emailLocal} onChange={(e)=>setEmailLocal(e.target.value)} required />
                <span className="input-group-text">@sinyalizasyon.com</span>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Şifre</label>
              <input type="password" className="form-control"
                     value={password} onChange={(e)=>setPassword(e.target.value)} required />
            </div>
            {err && <div className="alert alert-danger">{err}</div>}
            <button className="btn btn-primary" disabled={loading}>
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
