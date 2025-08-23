// client/src/components/RoleGate.jsx
import React from "react";
export default function RoleGate({ allow = [], fallback = null, children }) {
  const role = (sessionStorage.getItem("role") || "kullanıcı").toLowerCase();
  if (allow.map(a=>a.toLowerCase()).includes(role)) return children;
  return fallback;
}
