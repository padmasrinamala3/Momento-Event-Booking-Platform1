import React, { useState, useEffect } from "react";

// ── GLOBAL TOAST ──
let _setToasts = null;
export function showToast(msg, type = "", duration = 3000) {
  if (!_setToasts) return;
  const id = Date.now() + Math.random();
  _setToasts(p => [...p, { id, msg, type }]);
  setTimeout(() => _setToasts(p => p.filter(t => t.id !== id)), duration);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  useEffect(() => { _setToasts = setToasts; }, []);
  return (
    <div style={{ position:"fixed",top:70,left:"50%",transform:"translateX(-50%)",zIndex:9999,display:"flex",flexDirection:"column",alignItems:"center",gap:8,width:"90%",maxWidth:340,pointerEvents:"none" }}>
      {toasts.map(t => <div key={t.id} className={`toast toast-show ${t.type}`}>{t.msg}</div>)}
    </div>
  );
}

// ── LOADER ──
export function Loader({ onDone }) {
  const [hiding, setHiding] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => { setHiding(true); setTimeout(onDone, 700); }, 2400);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className={`loader ${hiding ? "loader-hide" : ""}`}>
      <div className="loader-logo">MomentO</div>
      <div className="loader-line" />
      <div className="loader-sub">Premium Event Planning</div>
    </div>
  );
}

// ── PATTERN BG ──
export function PatternBg() {
  return (
    <div className="pattern-bg">
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <defs>
          <pattern id="geo" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <polygon points="40,4 76,40 40,76 4,40" fill="none" stroke="#c9a84c" strokeWidth="0.6"/>
            <polygon points="40,18 62,40 40,62 18,40" fill="none" stroke="#c9a84c" strokeWidth="0.4"/>
            <circle cx="40" cy="40" r="1.2" fill="#c9a84c"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#geo)"/>
      </svg>
    </div>
  );
}

// ── BACK TO TOP ──
export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const fn = () => setShow(window.scrollY > 300);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  if (!show) return null;
  return <button id="backToTop" className="show" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>↑</button>;
}