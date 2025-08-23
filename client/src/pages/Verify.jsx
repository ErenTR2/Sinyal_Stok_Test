// client/src/pages/Verify.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Verify() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    const pending = sessionStorage.getItem("pendingEmail");
    if (!pending) {
      navigate("/kayit", { replace: true });
      return;
    }
    setEmail(pending);
  }, [navigate]);

  const handleVerify = async () => {
    setErr(""); setMsg("");
    if (!code.trim()) return setErr("Lütfen doğrulama kodunu girin.");
    try {
      setLoading(true);
      const { data } = await api.post("/auth/verify", { email, code });
      setMsg("E-posta doğrulandı. Yönlendiriliyorsunuz...");
      sessionStorage.removeItem("pendingEmail");
      sessionStorage.setItem("token", data?.token || "ok");
      setTimeout(() => navigate("/dashboard", { replace: true }), 600);
    } catch (e) {
      setErr(e?.response?.data?.error || "Doğrulama başarısız.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setErr(""); setMsg("");
    try {
      setLoading(true);
      await api.post("/auth/resend-code", { email });
      setMsg("Yeni doğrulama kodu e-postanıza gönderildi.");
    } catch (e) {
      setErr(e?.response?.data?.error || "Sunucuya ulaşılamadı.");
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => e.key === "Enter" && handleVerify();

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow p-4 p-md-5">
      <h1 className="h4 fw-semibold mb-2">E-posta Doğrulama</h1>
      <p className="text-muted mb-4">
        {email || "xxx@sinyalizasyon.com"} adresine gönderdiğimiz kodu yazınız.
      </p>

      <label className="form-label">Doğrulama Kodu</label>
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="6 haneli kod"
        className="form-control"
      />

      {err && <div className="alert alert-danger mt-3">{String(err)}</div>}
      {msg && <div className="alert alert-success mt-3">{String(msg)}</div>}

      <button onClick={handleVerify} disabled={loading} className="btn btn-dark w-100 mt-4">
        {loading ? "İşleniyor..." : "Doğrula"}
      </button>

      <button onClick={handleResend} disabled={loading} className="btn btn-outline-secondary w-100 mt-2">
        Kodu Tekrar Gönder
      </button>

      <button onClick={() => navigate("/kayit")} className="btn btn-link w-100 mt-2">
        Yanlış e-posta mı? Kayıta dön
      </button>
    </div>
  );
}
