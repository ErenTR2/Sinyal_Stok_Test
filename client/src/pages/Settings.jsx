import React, { useState } from "react";

export default function Settings(){
  const [tab, setTab] = useState("users");
  return (
    <div className="bg-white rounded-2xl shadow p-3 p-md-4">
      <h5>Ayarlar</h5>
      <div className="btn-group mt-2">
        <button className={"btn btn-sm "+(tab==="users"?"btn-dark":"btn-outline-secondary")} onClick={()=>setTab("users")}>Kullanıcı Yönetimi</button>
        <button className={"btn btn-sm "+(tab==="tags"?"btn-dark":"btn-outline-secondary")} onClick={()=>setTab("tags")}>Etiketler</button>
      </div>

      {tab==="users" ? <UsersTab/> : <TagsTab/>}
    </div>
  );
}

function UsersTab(){
  // TODO: backend ile kullanıcı listesi ve rol atama
  return (
    <div className="mt-3">
      <div className="alert alert-info">Kullanıcı listesi / rol atama ekranı (yönetici-kullanıcı-depocu) burada olacak.</div>
    </div>
  );
}
function TagsTab(){
  // TODO: etiket yönetimi
  return (
    <div className="mt-3">
      <div className="alert alert-info">Ürün etiketleri ekleme/silme/düzenleme burada olacak.</div>
    </div>
  );
}
