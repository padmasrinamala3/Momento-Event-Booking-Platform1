// ─────────────────────────────────────────────────────────────
//  MomentO — Centralized API Configuration
//  In development: uses localhost:5000
//  In production (AWS): uses REACT_APP_API_URL from .env
// ─────────────────────────────────────────────────────────────

const API_BASE =
  process.env.REACT_APP_API_URL ||
  `http://${window.location.hostname}:5000/api`;

export default API_BASE;
