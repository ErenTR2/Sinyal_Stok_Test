// client/src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [emailLocal, setEmailLocal] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (!username || !emailLocal || !password || !password2) {
      setError("Tüm alanları doldurun.");
      return;
    }
    if (password !== password2) {
      setError("Şifreler uyuşmuyor.");
      return;
    }

    const email = `${String(emailLocal).trim().toLowerCase()}@sinyalizasyon.com`;

    try {
      setLoading(true);

      // DEBUG: konsolda giden payload'ı gör
      console.log("register payload =>", {
        username: username.trim(),
        email,
        passLen: password.length,
      });

      const { data } = await api.post("/auth/register", {
        username: username.trim(),
        email,               // server auth.js bu ismi bekliyor
        password,
        password2,
      });

      // Başarılı -> verify akışına geç
      sessionStorage.setItem("pendingEmail", data?.email || email);
      navigate("/dogrulama");
    } catch (err) {
      console.error("register error =>", err?.response?.data || err.message);
      setError(err?.response?.data?.error || "Kayıt başarısız.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6">
          <h3 className="mb-3">Kayıt Ol</h3>
          <form onSubmit={submit} className="card card-body">
            <div className="mb-3">
              <label className="form-label">Ad Soyad</label>
              <input
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Mail Adresin</label>
              <div className="input-group">
                <input
                  className="form-control"
                  placeholder="ör: d.arioglu veya durmus.arioglu"
                  value={emailLocal}
                  onChange={(e) => setEmailLocal(e.target.value)}
                  required
                />
                <span className="input-group-text">@sinyalizasyon.com</span>
              </div>
              <div className="form-text">
                Tam adres:{" "}
                <strong>
                  {(emailLocal || "kullanici").toLowerCase()}@sinyalizasyon.com
                </strong>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Şifre</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Şifre (tekrar)</label>
              <input
                type="password"
                className="form-control"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                required
              />
            </div>

            {error && <div className="alert alert-danger">{String(error)}</div>}

            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? "İşleniyor..." : "Kayıt Ol"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
