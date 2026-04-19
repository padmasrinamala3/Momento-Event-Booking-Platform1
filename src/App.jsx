import React, { useState, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import "./App.css";
import { useApp } from "./context/AppContext";
import { eventsDataDefault, eventServices, categorizedMenus, WHATSAPP } from "./data/constants";

const API = process.env.REACT_APP_API_URL || "/api";

// ── TOAST ──
let _setToasts = null;
function showToast(msg, type = "", duration = 3000) {
  if (!_setToasts) return;
  const id = Date.now() + Math.random();
  _setToasts(p => [...p, { id, msg, type }]);
  setTimeout(() => _setToasts(p => p.filter(t => t.id !== id)), duration);
}

function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  useEffect(() => { _setToasts = setToasts; }, []);
  return (
    <div style={{ position: "fixed", top: 70, left: "50%", transform: "translateX(-50%)", zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "90%", maxWidth: 340, pointerEvents: "none" }}>
      {toasts.map(t => <div key={t.id} className={`toast toast-show ${t.type}`}>{t.msg}</div>)}
    </div>
  );
}

// ── SCROLL PROGRESS BAR ──
function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const fn = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop || document.body.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? (scrolled / total) * 100 : 0);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <>
      <style>{`@keyframes shimmerBar{0%{background-position:0% center}100%{background-position:200% center}}`}</style>
      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "3px", zIndex: 99999 }}>
        <div style={{
          height: "100%", width: `${progress}%`,
          background: "linear-gradient(90deg,#C9A84C,#ec4899,#C9A84C)",
          backgroundSize: "200% auto",
          transition: "width 0.1s linear",
          animation: "shimmerBar 2s linear infinite",
        }} />
      </div>
    </>
  );
}

// ── LOADER ──
function Loader({ onDone }) {
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

// ── NAVBAR ──
const NAV_LINKS = [
  { label: "Home", id: "home", icon: "🏠" }, { label: "About", id: "about", icon: "✦" },
  { label: "Events", id: "events", icon: "🎉" }, { label: "Calendar", id: "calendar", icon: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign: 'bottom', marginRight: 4}}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg> },
  { label: "Gallery", id: "gallery", icon: "🖼" }, { label: "Pricing", id: "pricing", icon: "💎" },
  { label: "Calculator", id: "calculator", icon: "🧮" }, { label: "My Account", id: "userAuth", icon: "👤" },
  { label: "Admin", id: "admin", icon: "⚙️" }, { label: "Reviews", id: "rating", icon: "⭐" },
  { label: "Our Team", id: "team", icon: "👥" }, { label: "Contact", id: "contact", icon: "📞" },
];

function Navbar({ loggedInUser, onLogout }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  const navTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setMenuOpen(false); };
  return (
    <>
      <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
        <div className="nav-container">
          <div className="logo" onClick={() => navTo("home")}>Moment<span>O</span></div>
          <ul className="nav-links">
            {NAV_LINKS.map(l => <li key={l.id}><button onClick={() => navTo(l.id)}>{l.label}</button></li>)}
          </ul>
          <div className="nav-right">
            {loggedInUser && <div className="nav-user-badge">👤 {loggedInUser.name}</div>}
            {loggedInUser && <button className="nav-logout-btn" onClick={onLogout}>Logout</button>}
            <button className={`hamburger ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(!menuOpen)}>
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>
      <div className={`mob-menu ${menuOpen ? "open" : ""}`}>
        {NAV_LINKS.map(l => (
          <button key={l.id} className="mob-link" onClick={() => navTo(l.id)}>
            <span className="ml-dot" /><span className="ml-icon">{l.icon}</span>{l.label}
          </button>
        ))}
      </div>
    </>
  );
}

// ── HERO ──
function Hero({ onExplore }) {
  const words = ["Moments Magical", "Dreams Come True", "Events Unforgettable"];
  const [wordIdx, setWordIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    const word = words[wordIdx];
    let timeout;
    if (typing) {
      if (displayed.length < word.length) {
        timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 80);
      } else {
        timeout = setTimeout(() => setTyping(false), 1800);
      }
    } else {
      if (displayed.length > 0) {
        timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 40);
      } else {
        setWordIdx(i => (i + 1) % words.length);
        setTyping(true);
      }
    }
    return () => clearTimeout(timeout);
  }, [displayed, typing, wordIdx]);

  return (
    <section id="home" className="hero-section hero-entrance">
      <style>{`
        @keyframes shimmerBtn {
          0%{background-position:-200% center}
          100%{background-position:200% center}
        }
        .btn-shimmer {
          background: linear-gradient(90deg, #111 0%, #111 35%, #C9A84C 50%, #111 65%, #111 100%) !important;
          background-size: 200% auto !important;
          animation: shimmerBtn 2.5s linear infinite !important;
          color: #C9A84C !important;
        }
        .btn-shimmer:hover {
          background: #C9A84C !important;
          color: #111 !important;
          animation: none !important;
        }
        .typing-cursor {
          display:inline-block;
          width:2px;
          height:0.9em;
          background:#C9A84C;
          margin-left:3px;
          vertical-align:middle;
          animation: cursorBlink 0.75s step-end infinite;
        }
        @keyframes cursorBlink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes sectionReveal {
          from { opacity:0; transform:translateY(32px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .section-reveal {
          opacity: 0;
          transform: translateY(32px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .section-reveal.in-view {
          opacity: 1;
          transform: translateY(0);
        }
        .event-card {
          transition: transform 0.32s ease, box-shadow 0.32s ease !important;
        }
        .event-card:hover {
          transform: translateY(-8px) !important;
          box-shadow: 0 16px 40px rgba(201,168,76,0.25) !important;
        }
        .price-card {
          transition: transform 0.32s ease, box-shadow 0.32s ease !important;
        }
        .price-card:hover {
          transform: translateY(-6px) !important;
          box-shadow: 0 14px 36px rgba(201,168,76,0.2) !important;
        }
        .review-card {
          transition: transform 0.32s ease, box-shadow 0.32s ease !important;
        }
        .review-card:hover {
          transform: translateY(-5px) !important;
          box-shadow: 0 10px 28px rgba(201,168,76,0.18) !important;
        }
      `}</style>
      <div className="hero-bg" />
      <div className="hero-overlay" />
      <div className="hero-content">
        <div className="hero-eyebrow">✦ Premium Event Planning ✦</div>
        <h1>
          We Make Your<br />
          <em>{displayed}<span className="typing-cursor" /></em>
        </h1>
        <div className="hero-divider">
          <span style={{ position: "absolute", left: -14, top: -6, color: "var(--gold)", fontSize: 8 }}>◆</span>
          <span style={{ position: "absolute", right: -14, top: -6, color: "var(--gold)", fontSize: 8 }}>◆</span>
        </div>
        <p>Book your dream event with professional planning, curated vendors & premium services — all in one place.</p>
        <button className="btn-primary btn-shimmer" onClick={() => onExplore("events")}>Explore Events</button>
      </div>
      <div className="scroll-hint">
        <span>Scroll</span>
        <div className="scroll-line" />
      </div>
    </section>
  );
}

// ── EVENT COST CALCULATOR ──
function EventCostCalculator() {

  const revealRef = useSectionReveal();
  const [eventType, setEventType] = useState("Wedding");
  const [guests, setGuests] = useState(100);
  const [selected, setSelected] = useState([]);
  const [foodType, setFoodType] = useState("veg");
  const [activeMenu, setActiveMenu] = useState(null);

  const getSPrice = (s) => {
    if (s.vegPrice || s.nonVegPrice) {
      return (foodType === "veg" ? s.vegPrice : s.nonVegPrice) * guests;
    }
    return s.price;
  };
  const total = selected.reduce((a, s) => a + getSPrice(s), 0);
  const emi = Math.ceil((total * 0.7) / 3);
  const services = eventServices[eventType] || [];
  const toggle = (s) => setSelected(p => p.find(x => x.name === s.name) ? p.filter(x => x.name !== s.name) : [...p, s]);
  const navTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  // Icons mapping
  const getSvcIcon = (name) => {
    const low = name.toLowerCase();
    if (low.includes("catering") || low.includes("food")) return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>;
    if (low.includes("decor")) return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>;
    if (low.includes("photo") || low.includes("video")) return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>;
    if (low.includes("dj") || low.includes("music") || low.includes("sound")) return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;
    if (low.includes("artist") || low.includes("makeup") || low.includes("mehendi")) return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>;
    return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
  };

  return (
    <section id="calculator" className="section-reveal" ref={revealRef} style={{ padding: "80px 0" }}>
      <div className="section-wrap">
        <div className="section-label">Tailored Planning</div>
        <h2 className="section-title">Luxury <em>Investment</em> Calculator</h2>
        <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13, maxWidth: 520, margin: "0 auto 45px", lineHeight: 1.8 }}>
          Precisely estimate your grand event. Select exclusive services to build your customized celebration package.
        </p>

        <div className="calc-container">
          <div className="calc-type-selector">
            {Object.keys(eventServices).map(e => (
              <button key={e} className={`calc-type-pill ${eventType === e ? 'active' : ''}`} onClick={() => { setEventType(e); setSelected([]); }}>
                {e}
              </button>
            ))}
          </div>

          <div className="calc-interaction-row">
            <div className="calc-control-group">
              <span className="calc-control-label">Estimated Guests</span>
              <div className="calc-counter-wrap">
                <button className="calc-counter-btn" onClick={() => setGuests(Math.max(10, guests - 10))}>−</button>
                <div className="calc-counter-val">{guests}</div>
                <button className="calc-counter-btn" onClick={() => setGuests(guests + 10)}>+</button>
              </div>
            </div>

            <div className="calc-control-group">
              <span className="calc-control-label">Catering Options</span>
              <div className="calc-toggle-switch">
                <div className={`calc-toggle-opt veg ${foodType === 'veg' ? 'active' : ''}`} onClick={() => setFoodType('veg')}>
                  <span>🥬 Veg</span>
                </div>
                <div className={`calc-toggle-opt nonveg ${foodType === 'non_veg' ? 'active' : ''}`} onClick={() => setFoodType('non_veg')}>
                  <span>🍗 Non-Veg</span>
                </div>
                <div className="calc-toggle-bg" />
              </div>
            </div>
          </div>

          <div className="calc-services-box">
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--gold)", marginBottom: 18, opacity: 0.8, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ height: 1, flex: 1, background: "rgba(201,168,76,0.15)" }}></span>
              Available Services
              <span style={{ height: 1, flex: 1, background: "rgba(201,168,76,0.15)" }}></span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 10 }}>
              {services.map((s, i) => {
                const isSel = selected.find(x => x.name === s.name);
                const sPrice = getSPrice(s);
                return (
                  <div key={i} className={`calc-service-item ${isSel ? 'active' : ''}`} onClick={() => toggle(s)}>
                    <div className="calc-service-circle">✓</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                        <span style={{ color: "var(--gold)", opacity: 0.7 }}>{getSvcIcon(s.name)}</span>
                        <span style={{ fontSize: 13, color: isSel ? "#fff" : "#ccc", fontWeight: 400 }}>{s.name}</span>
                      </div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
                        {(s.vegPrice || s.nonVegPrice) ? `Premium catering at ₹${(foodType === "veg" ? s.vegPrice : s.nonVegPrice)}/guest` : "Curated professional service"}
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: isSel ? "var(--gold)" : "var(--text-muted)", fontWeight: 500 }}>
                      ₹{sPrice.toLocaleString("en-IN")}
                    </div>
                    {(s.vegPrice || s.nonVegPrice) && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveMenu(s.name); }}
                        style={{ position: "absolute", top: 5, right: 5, background: "rgba(201,168,76,0.1)", border: "none", color: "var(--gold)", padding: "2px 6px", borderRadius: 4, fontSize: 8, cursor: "pointer", letterSpacing: 1 }}
                      >VIEW MENU</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {total > 0 ? (
            <div className="calc-total-wrap">
              <div className="calc-total-card">
                <div className="calc-total-glow" />
                <div className="calc-total-grid">
                  <div className="calc-summary">
                    <div style={{ color: "var(--gold)", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", fontSize: 11, marginBottom: 8 }}>Package Preview</div>
                    <div style={{ fontSize: 15, color: "#fff", fontFamily: "'Cormorant Garamond',serif", marginBottom: 5 }}>{eventType} Experience</div>
                    <ul>
                      {selected.map((s, idx) => <li key={idx}>{s.name}</li>)}
                    </ul>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 10, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: 2, marginBottom: 4 }}>Estimated Investment</div>
                    <div style={{ fontSize: 36, color: "var(--gold)", fontFamily: "'Cormorant Garamond',serif", lineHeight: 1 }}>₹{total.toLocaleString("en-IN")}</div>
                    <div style={{ fontSize: 11, color: "var(--green)", marginTop: 8 }}>Flex Pay: ₹{emi.toLocaleString("en-IN")} × 3 months</div>
                  </div>
                </div>
                <button className="btn-primary" style={{ width: "100%", marginTop: 24, padding: "18px" }} onClick={() => navTo("events")}>
                  Check Availability & Reserve
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", marginTop: 30, padding: "40px", background: "rgba(255,255,255,0.02)", borderRadius: 16, border: "1px dashed rgba(201,168,76,0.2)" }}>
              <div style={{ fontSize: 24, color: "rgba(201,168,76,0.3)", marginBottom: 10 }}>✧</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", letterSpacing: 1 }}>Select your curated services to calculate the investment</div>
            </div>
          )}
        </div>
      </div>

      {activeMenu && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setActiveMenu(null)}>
          <div className="calc-container" style={{ maxWidth: 480, width: "100%", padding: 35, boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 25 }}>
              <div>
                <div style={{ fontSize: 10, color: "var(--gold)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Curation Preview</div>
                <h3 style={{ fontFamily: "'Cormorant Garamond',serif", color: "#fff", fontSize: 28, lineHeight: 1.2 }}>{activeMenu}<br /><span style={{ color: "var(--gold)" }}>{foodType === "veg" ? "Pure Vegetarian" : "Signature Non-Veg"}</span></h3>
              </div>
              <button onClick={() => setActiveMenu(null)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", cursor: "pointer", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {(() => {
                let category = "buffet";
                const sName = activeMenu.toLowerCase();
                const eName = eventType.toLowerCase();

                if (sName.includes("high tea") || sName.includes("cookies")) category = "high_tea";
                else if (sName.includes("lunch box")) category = "lunch_box";
                else if (sName.includes("youth") || sName.includes("snack") || sName.includes("fast food") || 
                         eName.includes("fest") || eName.includes("concert") || eName.includes("farewell")) category = "youth";

                const menu = categorizedMenus[category][foodType];
                
                return menu.map((item, idx) => (
                  <div key={idx} style={{ fontSize: 12, color: "#aaa", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "var(--gold)", fontSize: 8 }}>✦</span> {item.replace(/🥬 |🍗 /, "")}
                  </div>
                ));
              })()}
            </div>
            <button className="btn-primary" style={{ width: "100%", marginTop: 30 }} onClick={() => setActiveMenu(null)}>Close Curation</button>
          </div>
        </div>
      )}
    </section>
  );
}

function useSectionReveal() {
  const ref = useRef();
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { entry.target.classList.add("in-view"); obs.unobserve(entry.target); } },
      { threshold: 0.12 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return ref;
}

// ── COUNT UP HOOK ──
function useCountUp(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(target);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

// ── STAT BOX ──
function StatBox({ num, label, delay = 0, started }) {
  const isPercent = num.includes("%");
  const isPlus = num.includes("+");
  const target = parseInt(num.replace(/[^0-9]/g, ""));
  const [go, setGo] = useState(false);

  useEffect(() => {
    if (started) {
      const t = setTimeout(() => setGo(true), delay);
      return () => clearTimeout(t);
    }
  }, [started, delay]);

  const count = useCountUp(target, 2000, go);

  return (
    <div className="stat-box">
      <div className="stat-num">
        {count}{isPercent ? "%" : ""}{isPlus ? "+" : ""}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

// ── ABOUT ──
function About() {
  const ref = useRef();
  const statsRef = useRef();
  const [statsStarted, setStatsStarted] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }), { threshold: 0.15 });
    ref.current?.querySelectorAll(".reveal").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setStatsStarted(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  const stats = [
    { num: "500+", label: "Events Hosted" },
    { num: "11", label: "Event Categories" },
    { num: "98%", label: "Happy Clients" },
    { num: "7+", label: "Years Exp." },
  ];

  const revealRef = useSectionReveal();
  return (
    <section id="about" className="about-section section-reveal" ref={(el) => { ref.current = el; revealRef.current = el; }}>
      <div className="section-wrap">
        <div className="section-label">Our Story</div>
        <h2 className="section-title">Crafting <em>Extraordinary</em> Events</h2>
        <div className="about-text reveal">
          <p>MomentO is a premium event booking platform designed to make your celebrations simple, stress-free, and truly unforgettable.</p>
          <p>From grand weddings and intimate birthdays to corporate galas — we connect you with trusted vendors for catering, décor, photography, entertainment, and more.</p>
        </div>
        <div className="about-stats reveal" ref={statsRef}>
          {stats.map((s, i) => (
            <StatBox key={i} num={s.num} label={s.label} delay={i * 150} started={statsStarted} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── EVENTS ──
function Events({ eventsData, onReserve, onViewThemes }) {
  const ref = useRef();
  const revealRef = useSectionReveal();
  useEffect(() => {
    const obs = new IntersectionObserver((es) => { es.forEach((e, i) => { if (e.isIntersecting) setTimeout(() => e.target.classList.add("visible"), i * 70); }); }, { threshold: 0.1 });
    ref.current?.querySelectorAll(".reveal").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [eventsData]);
  return (
    <section id="events" className="section-reveal" ref={revealRef}>
      <div className="section-wrap">
        <div className="section-label">What We Offer</div>
        <h2 className="section-title">Our <em>Events</em></h2>
        <div className="events-grid" ref={ref}>
          {eventsData.filter(e => e.status === "active").map((e, i) => (
            <div key={i} className="event-card reveal">
              {e.name === "Wedding" && <div className="trending-badge">Trending ✦</div>}
              <div
                className="event-card-img-wrap"
                onClick={() => onViewThemes(e)}
                title="Click to view decoration themes"
                style={{ cursor: "pointer" }}
              >
                <img className="event-card-img" src={e.img} loading="lazy" alt={e.name} onError={ev => ev.target.src = "https://i.pinimg.com/736x/e4/2b/55/e42b5578b225b29e8b65010a975a2d1e.jpg"} />
                <div className="img-overlay-hint">View Themes ✦</div>
              </div>
              <div className="event-card-body">
                <div className="rating-tag">★ {e.name === "Wedding" ? "4.9" : "4.8"} <span>({e.name === "Wedding" ? "120+" : "40+"} Bookings)</span></div>
                <div className="event-card-tag">{e.tag}</div>
                <div className="event-card-name">{e.name}</div>
                <button className="event-card-btn" onClick={() => onReserve(e)}>Reserve</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CALENDAR ──
function CalendarSection({ bookings = [] }) {
  const revealRef = useSectionReveal();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const year = currentDate.getFullYear(), month = currentDate.getMonth();

  // Get booked shifts for a day
  const getDayShifts = (day) => {
    const dStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const dayBookings = bookings.filter(b => b.date === dStr && b.status !== "cancelled");
    return {
      morning: dayBookings.some(b => b.shift === "morning"),
      night: dayBookings.some(b => b.shift === "night"),
      midnight: dayBookings.some(b => b.shift === "midnight")
    };
  };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  const today = new Date();

  return (
    <section id="calendar" className="calendar-section section-reveal" ref={revealRef}>
      <div className="section-wrap">
        <div className="section-label">Availability</div>
        <h2 className="section-title">Event <em>Calendar</em></h2>
        <p className="section-sub">Check available dates. Each date has 3 slots available for bookings.</p>
        <div className="cal-wrap" style={{ maxWidth: 520, margin: "0 auto" }}>
          <div className="cal-nav">
            <button className="cal-nav-btn" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>‹</button>
            <div className="cal-month">{MONTHS[month]} {year}</div>
            <button className="cal-nav-btn" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>›</button>
          </div>
          <div className="cal-days-header">{DAYS.map(d => <div key={d} className="cal-day-label">{d}</div>)}</div>
          <div className="cal-grid">
            {cells.map((day, i) => {
              if (!day) return <div key={i} />;
              const shifts = getDayShifts(day);
              const isFull = shifts.morning && shifts.night && shifts.midnight;
              const isLimited = shifts.morning || shifts.night || shifts.midnight;
              const isSel = selectedDay === day;
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

              const getTooltip = () => {
                if (isFull) return "All 3 Shifts Booked (Full)";
                const s = [];
                if (shifts.morning) s.push("Morning Booked"); else s.push("Morning Available");
                if (shifts.night) s.push("Night Booked"); else s.push("Night Available");
                if (shifts.midnight) s.push("Midnight Booked"); else s.push("Midnight Available");
                return s.join(", ");
              };

              return (
                <button
                  key={i}
                  className={`cal-cell${isFull ? " booked" : isLimited ? " limited" : ""}${isSel ? " selected" : ""}${isToday ? " today" : ""}`}
                  onClick={() => !isFull && setSelectedDay(selectedDay === day ? null : day)}
                  disabled={isFull}
                  title={getTooltip()}
                  style={{ position: "relative" }}
                >
                  {day}
                  {isLimited && <div className="calendar-booked-pulse" />}
                  <div className="cal-shift-dots">
                    <div className={`shift-dot morning${shifts.morning ? " booked" : ""}`} />
                    <div className={`shift-dot night${shifts.night ? " booked" : ""}`} />
                    <div className={`shift-dot midnight${shifts.midnight ? " booked" : ""}`} />
                  </div>
                </button>
              );
            })}
          </div>
          <div className="cal-legend">
            <div className="cal-legend-item"><div className="shift-dot morning" style={{ width: 8, height: 8 }} />Morning</div>
            <div className="cal-legend-item"><div className="shift-dot night" style={{ width: 8, height: 8 }} />Night</div>
            <div className="cal-legend-item"><div className="shift-dot morning booked" style={{ width: 8, height: 8, opacity: 1 }} />Booked</div>
          </div>
          {selectedDay && <div className="cal-selected-msg">✦ {MONTHS[month]} {selectedDay}, {year} — Slotted for booking!</div>}
        </div>
      </div>
    </section>
  );
}


// ── PRICING ──
function Pricing({ onBookPkg }) {
  const revealRef = useSectionReveal();
  const plans = [
    { name: "Basic", price: "₹15,000", num: 15000, sub: "Perfect for small gatherings", emi: "₹5,000", features: ["Basic Decoration", "Photography (4 hrs)", "Catering (50 persons)", "Event Coordinator"] },
    { name: "Premium", price: "₹35,000", num: 35000, sub: "Best value for celebrations", emi: "₹11,667", popular: true, features: ["Flower & Stage Decoration", "Photography + Video", "Catering (100 persons)", "DJ / Music (3 hrs)", "Dedicated Coordinator"] },
    { name: "Royal", price: "₹75,000", num: 75000, sub: "Ultimate luxury experience", emi: "₹25,000", features: ["Full Stage & Floral Decoration", "Photography + Drone Video", "Catering (200 persons)", "DJ Night (6 hrs)", "Mehendi + Makeup Artist", "VIP Coordinator"] },
  ];
  return (
    <section id="pricing" className="pricing-section section-reveal" ref={revealRef}>
      <div className="section-wrap">
        <div className="section-label">Packages</div>
        <h2 className="section-title">Pricing <em>Packages</em></h2>
        <div className="pricing-grid">
          {plans.map((p, i) => (
            <div key={i} className={`price-card${p.popular ? " popular" : ""}`}>
              {p.popular && <div className="popular-badge">⭐ Most Popular</div>}
              <h3>{p.name}</h3><div className="price-tag-sub">{p.sub}</div>
              <div className="price">{p.price}</div><div className="emi-note">or {p.emi}/month × 3</div>
              <ul>{p.features.map((f, j) => <li key={j}>{f}</li>)}</ul>
              <button className="btn-primary" style={{ width: "100%" }} onClick={() => onBookPkg(p.name, p.price, p.num, 3)}>Book This Package</button>
            </div>
          ))}
        </div>
        <div className="compare-wrap">
          <h3>◈ Compare Packages</h3>
          <table className="compare-table">
            <thead><tr><th style={{ textAlign: "left" }}>Feature</th><th>Basic</th><th className="highlight">Premium ⭐</th><th>Royal</th></tr></thead>
            <tbody>
              <tr><td>Decoration</td><td>Basic</td><td className="highlight">Luxury</td><td>Royal</td></tr>
              <tr><td>Photography</td><td><span className="check">✔</span></td><td className="highlight"><span className="check">✔ HD</span></td><td><span className="check">✔ Cinematic</span></td></tr>
              <tr><td>Videography</td><td><span className="cross">✘</span></td><td className="highlight"><span className="check">✔</span></td><td><span className="check">✔</span></td></tr>
              <tr><td>DJ / Music</td><td><span className="cross">✘</span></td><td className="highlight"><span className="check">✔</span></td><td><span className="check">✔ Live</span></td></tr>
              <tr><td>EMI</td><td><span className="check">✔</span></td><td className="highlight"><span className="check">✔</span></td><td><span className="check">✔</span></td></tr>
              <tr><td><strong>Price</strong></td><td>₹15K</td><td className="highlight" style={{ color: "var(--gold)", fontWeight: 600 }}>₹35K</td><td>₹75K</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// ── USER AUTH ──
function UserAuth({ loggedInUser, setLoggedInUser, bookings, onOpenInvoice }) {
  const revealRef = useSectionReveal();
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [showGoogleMock, setShowGoogleMock] = useState(false);
  const myBookings = bookings.filter(b => b.userEmail === loggedInUser?.email);

  const mockGoogleAccounts = [
    { name: "Padmasri Namala", email: "padmasri.n@gmail.com", avatar: "P" },
    { name: "Srinivas Rao", email: "srinivas.rao@outlook.com", avatar: "S" },
    { name: "Guest Explorer", email: "guest@moment-o.com", avatar: "G" }
  ];

  const cancelBooking = (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    fetch(`${API}/bookings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" })
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to cancel");
        showToast("Booking cancelled successfully", "success");
        setTimeout(() => window.location.reload(), 1500);
      })
      .catch(err => showToast("Error: " + err.message, "error"));
  };

  const finalizeGoogleLogin = (acc) => {
    setShowGoogleMock(false);
    showToast(`? Authorizing with Google...`, "processing");
    
    fetch(`${API}/auth/google-callback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: acc.name, email: acc.email })
    })
      .then(r => r.json())
      .then(data => {
        if (data.message) { setError("? Google Auth Failed: " + data.message); return; }
        setLoggedInUser(data);
        showToast(" Welcome, " + data.name + "! Logged in via Google.", "confirmed");
      })
      .catch(err => setError("? Google Auth Error: " + err.message));
  };

  const login = () => {
    if (!form.email || !form.password) { setError("✗ Fill email and password"); return; }
    setError("");
    fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email, password: form.password })
    })
      .then(r => r.json())
      .then(data => {
        if (data.message) { setError("✗ " + data.message); return; }
        setLoggedInUser(data);
        showToast("✓ Welcome back, " + data.name + "!", "success");
      })
      .catch((err) => setError("✗ Network Error: " + err.message));
  };

  const register = () => {
    if (!form.name || !form.email || !form.phone || !form.password) { setError("✗ Fill all fields"); return; }
    if (form.password.length < 6) { setError("✗ Password min 6 chars"); return; }
    setError("");
    fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, password: form.password })
    })
      .then(r => r.json())
      .then(data => {
        if (data.message) { setError("✗ " + data.message); return; }
        setLoggedInUser(data);
        showToast("🎉 Welcome, " + data.name + "!", "confirmed");
      })
      .catch((err) => setError("✗ Network Error: " + err.message));
  };

  const forgotPassword = () => {
    if (!form.email || !form.password) { setError("✗ Please enter your email and a new password"); return; }
    setError("");
    fetch(`${API}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email, newPassword: form.password })
    })
      .then(r => r.json())
      .then(data => {
        if (data.message === "Email not found in our records" || data.message === "Email and new password are required") {
          setError("✗ " + data.message);
          return;
        }
        showToast("✅ " + data.message, "success");
        setTab("login");
      })
      .catch((err) => setError("✗ Network Error: " + err.message));
  };

  const logout = () => {
    setLoggedInUser(null); setForm({ name: "", email: "", phone: "", password: "" }); setTab("login");
    showToast("✓ Logged out", "");
  };

  const badge = (status) => {
    const c = { pending: "#f0a500", confirmed: "#c9a84c", completed: "#4caf82", cancelled: "#e05a5a" };
    return <span style={{ background: "rgba(201,168,76,.12)", border: `1px solid ${c[status] || "#c9a84c"}`, color: c[status] || "#c9a84c", fontSize: 10, padding: "3px 10px", borderRadius: 20 }}>{status}</span>;
  };

  return (
    <section id="userAuth" className="userauth-section section-reveal" ref={revealRef}>
      <div className="section-wrap">
        <div className="section-label">My Account</div>
        <h2 className="section-title">User <em>{loggedInUser ? "Dashboard" : "Login"}</em></h2>
        {loggedInUser ? (
          <div className="dashboard-container">
            <div className="user-welcome-card">
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div className="user-avatar-large">{loggedInUser.name[0].toUpperCase()}</div>
                <div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, margin: 0 }}>Hello, {loggedInUser.name}!</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: 13, margin: "4px 0" }}>{loggedInUser.email}</p>
                  <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                    <span className="user-stat-tag">◈ {myBookings.length} Bookings</span>
                    <span className="user-stat-tag">✦ Verified Client</span>
                  </div>
                </div>
              </div>
              <button className="btn-logout-minimal" onClick={logout}>Sign Out</button>
            </div>

            <div className="dashboard-grid">
              <div className="dashboard-main">
                <div className="section-subtitle-dash">◈ Recent Activity</div>
                <div className="booking-card-list-alt">
                  {myBookings.length === 0 ? (
                    <div className="empty-state">
                      <p>You haven't booked any events yet.</p>
                      <button className="btn-primary" style={{ padding: "8px 20px" }} onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}>Browse Events</button>
                    </div>
                  ) : myBookings.slice(0, 5).map((b, i) => (
                    <div key={i} className="dashboard-booking-card">
                      <div className="dbc-info">
                        <div className="dbc-id">{b.id}</div>
                        <div className="dbc-event">{b.event}</div>
                        <div className="dbc-footer">
                          <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign: 'text-bottom', marginRight: 4}}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                          {b.date} · {b.shift}
                        </div>
                      </div>
                      <div className="dbc-status-wrap">
                        {badge(b.status)}
                        <button className="btn-invoice-dash" onClick={() => onOpenInvoice(b.id)}>View Invoice</button>
                        {b.status !== "cancelled" && (
                          <button 
                            style={{ background: "rgba(224,90,90,0.1)", border: "1px solid #e05a5a", color: "#e05a5a", padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontSize: 13, transition: "0.2s" }}
                            onClick={() => cancelBooking(b.id || b._id)}
                            onMouseOver={(e) => { e.target.style.background = "#e05a5a"; e.target.style.color = "#fff"; }}
                            onMouseOut={(e) => { e.target.style.background = "rgba(224,90,90,0.1)"; e.target.style.color = "#e05a5a"; }}
                          >
                            ❌ Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="dashboard-side">
                <div className="section-subtitle-dash">✦ Quick Actions</div>
                <div className="quick-actions-list">
                  <div className="qa-item"><span>📞 Need Help?</span><a href="tel:+918123456789">+91 81234 56789</a></div>
                  <div className="qa-item"><span>💬 WhatsApp</span><a href="#">Chat with Expert</a></div>
                  <div className="qa-item"><span>⭐ Review</span><button onClick={() => document.getElementById('rating')?.scrollIntoView({ behavior: 'smooth' })}>Rate us</button></div>
                </div>

                <div className="policy-box-dash" style={{ marginTop: 20 }}>
                  <h4>Cancellation Policy</h4>
                  <p>30% Advance is non-refundable. Cancellations must be made 48 hours before the event.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="auth-premium-container">
            {/* Premium Sliding Tabs */}
            <div className="auth-tabs-premium">
              {["login", "register", "forgot"].map((t, idx) => (
                <button key={t} className={`auth-tab-btn${tab === t ? " active" : ""}`} onClick={() => { setTab(t); setError(""); }}>
                  {t === "login" ? "Login" : t === "register" ? "Register" : "Forgot"}
                </button>
              ))}
              <div className="auth-tab-btn-bg" style={{ transform: `translateX(${tab === 'login' ? '0' : tab === 'register' ? '100%' : '200%'})` }} />
            </div>

            <div className="auth-form-card">
              {tab === "login" && <>
                <h3>◈ Welcome Back</h3>
                <div className="auth-input-group">
                  <label>Email Address</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon">✉</span>
                    <input className="auth-input-premium" type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} onKeyDown={e => e.key === "Enter" && login()} />
                  </div>
                </div>
                <div className="auth-input-group">
                  <label>Password</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon">🔒</span>
                    <input className="auth-input-premium" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} onKeyDown={e => e.key === "Enter" && login()} />
                  </div>
                </div>
                {error && <div className="auth-error show" style={{ marginBottom: 15 }}>{error}</div>}
                <button className="auth-btn-submit" onClick={login}>Login to My Account</button>
              </>}

              {tab === "register" && <>
                <h3>◈ Create Account</h3>
                <div className="auth-input-group">
                  <label>Full Name</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon">👤</span>
                    <input className="auth-input-premium" type="text" placeholder="Your full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  </div>
                </div>
                <div className="auth-input-group">
                  <label>Email</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon">✉</span>
                    <input className="auth-input-premium" type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  </div>
                </div>
                <div className="auth-input-group">
                  <label>Phone Number</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon">📱</span>
                    <input className="auth-input-premium" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                  </div>
                </div>
                <div className="auth-input-group">
                  <label>Password</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon">🔒</span>
                    <input className="auth-input-premium" type="password" placeholder="Min 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} onKeyDown={e => e.key === "Enter" && register()} />
                  </div>
                </div>
                {error && <div className="auth-error show" style={{ marginBottom: 15 }}>{error}</div>}
                <button className="auth-btn-submit" onClick={register}>Activate Membership</button>
                <div style={{ textAlign: "center", marginTop: 22, fontSize: 13, color: "var(--text-muted)" }}>
                  Already have an account? <span style={{ color: "var(--gold)", cursor: "pointer", fontWeight: 600 }} onClick={() => { setTab("login"); setError(""); }}>Log in</span>
                </div>
              </>}

              {tab === "forgot" && <>
                <h3>◈ Access Recovery</h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", marginBottom: 25, lineHeight: 1.6 }}>Enter your email and a <strong>new password</strong> to reset your account access.</p>
                <div className="auth-input-group">
                  <label>Registered Email</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon">✉</span>
                    <input className="auth-input-premium" type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  </div>
                </div>
                <div className="auth-input-group">
                  <label>New Password</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon">🔒</span>
                    <input className="auth-input-premium" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} onKeyDown={e => e.key === "Enter" && forgotPassword()} />
                  </div>
                </div>
                {error && <div className="auth-error show" style={{ marginBottom: 15 }}>{error}</div>}
                <button className="auth-btn-submit" onClick={forgotPassword}>Reset Password & Login</button>
                <div style={{ textAlign: "center", marginTop: 20, fontSize: 12 }}>
                   <span style={{ color: "var(--text-muted)", cursor: "pointer" }} onClick={() => setTab("login")}>← Back to Login</span>
                </div>
              </>}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ── ADMIN ──
function Admin({ eventsData, setEventsData, bookings, setBookings, onOpenInvoice }) {
  const { loggedInUser } = useApp();
  const revealRef = useSectionReveal();
  const [unlocked, setUnlocked] = useState(false);
  const [user, setUser] = useState(""); const [pass, setPass] = useState("");
  const [form, setForm] = useState({ name: "", tag: "", img: "", status: "active" });
  const [editIdx, setEditIdx] = useState(-1);
  const [adminReviews, setAdminReviews] = useState([]);
  const lastBookingCount = useRef(bookings.length);

  // Live Notification for new bookings
  useEffect(() => {
    if (unlocked && bookings.length > lastBookingCount.current) {
      const newBooking = bookings[0]; // Assuming newest is first
      showToast(`🔔 New Booking: ${newBooking.name} for ${newBooking.event}`, "success", 5000);

      // Play a subtle notification sound (optional, but keep it browser-friendly)
      // new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(() => {});
    }
    lastBookingCount.current = bookings.length;
  }, [bookings, unlocked]);

  // Auto-unlock if user is admin
  useEffect(() => {
    if (loggedInUser?.role === "admin") {
      setUnlocked(true);
    }
  }, [loggedInUser]);

  // Fetch reviews when unlocked
  useEffect(() => {
    if (unlocked) {
      fetch(`${API}/reviews`)
        .then(r => r.json())
        .then(data => { if (Array.isArray(data)) setAdminReviews(data); })
        .catch(err => console.error("❌ Admin could not load reviews:", err));
    }
  }, [unlocked]);

  const handleDeleteReview = (id) => {
    if (!window.confirm("Delete this review?")) return;
    fetch(`${API}/reviews/${id}`, { method: "DELETE" })
      .then(async r => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.message || "Delete failed");
        setAdminReviews(prev => prev.filter(r => r._id !== id));
        showToast("✓ Review deleted from database", "success");
      })
      .catch(err => {
        console.error("❌ Delete review error:", err);
        showToast(`⚠ Error: ${err.message}`, "processing", 5000);
      });
  };

  const saveEvent = () => {
    if (!form.name || !form.tag) { showToast("✗ Name and Category required", "processing"); return; }
    const ev = { name: form.name, tag: form.tag, img: form.img || "https://i.pinimg.com/736x/e4/2b/55/e42b5578b225b29e8b65010a975a2d1e.jpg", status: form.status };
    if (editIdx >= 0) { const d = [...eventsData]; d[editIdx] = ev; setEventsData(d); showToast("✓ Event updated", "success"); }
    else { setEventsData(p => [...p, ev]); showToast("✓ Event added", "success"); }
    setForm({ name: "", tag: "", img: "", status: "active" }); setEditIdx(-1);
  };

  // Analytics Computation
  const activeBookings = bookings.filter(b => b.status !== "cancelled");
  const totalRevenue = activeBookings.reduce((sum, b) => sum + (typeof b.price === "number" ? b.price : parseInt((b.price || "").toString().replace(/[^\d]/g, "") || 0)), 0);
  const pendingCount = bookings.filter(b => b.status === "pending").length;

  const catCounts = {};
  activeBookings.forEach(b => { catCounts[b.event] = (catCounts[b.event] || 0) + 1; });
  const pieData = Object.keys(catCounts).map(k => ({ name: k, value: catCounts[k] }));
  const PIE_COLORS = ["#c9a84c", "#4caf82", "#a855f7", "#3b82f6", "#ec4899", "#f0a500", "#06b6d4", "#e05a5a"];

  const revenueByMonth = {};
  activeBookings.forEach(b => {
    if (!b.date) return;
    const m = new Date(b.date).toLocaleString('default', { month: 'short' });
    const p = typeof b.price === "number" ? b.price : parseInt((b.price || "").toString().replace(/[^\d]/g, "") || 0);
    revenueByMonth[m] = (revenueByMonth[m] || 0) + p;
  });
  const allMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonthIdx = new Date().getMonth();
  // Show up to next month
  let monthlyData = allMonths.map(m => ({ name: m, Revenue: revenueByMonth[m] || 0 }));
  monthlyData = monthlyData.filter((d, i) => i <= currentMonthIdx + 1 || d.Revenue > 0);
  if (monthlyData.length < 3) monthlyData = [{ name: "Prev", Revenue: 0 }, ...monthlyData]; // padding if too short

  return (
    <section id="admin" className="admin-section section-reveal" ref={revealRef}>
      <div className="section-wrap">
        <div className="section-label">Management</div>
        <h2 className="section-title">Admin <em>Panel</em></h2>
        {!unlocked ? (
          <div className="admin-login-box" style={{ maxWidth: 420, margin: "0 auto", textAlign: "center" }}>
            <div style={{ marginBottom: 28 }}>
              <div style={{ width: 100, height: 100, margin: "0 auto", borderRadius: "50%", border: "2px solid var(--gold)", padding: 5, background: "rgba(201,168,76,0.05)", position: "relative", boxShadow: "0 8px 25px rgba(0,0,0,0.4)" }}>
                <img src="/admin.png" alt="Padmasri" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                <div style={{ position: "absolute", bottom: 5, right: 5, width: 22, height: 22, background: "var(--gold)", borderRadius: "50%", border: "3px solid var(--surface2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#111", fontWeight: "bold" }}>✦</div>
              </div>
              <h3 style={{ marginTop: 18, marginBottom: 5, fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 500 }}>Padmasri Namala</h3>
              <div style={{ fontSize: 10, color: "var(--gold)", letterSpacing: 2.5, textTransform: "uppercase", opacity: 0.8 }}>Authorized Personnel Only</div>
            </div>
            <div className="auth-input-group" style={{ textAlign: "left", marginBottom: 15 }}>
              <label style={{ fontSize: 10, letterSpacing: 2, color: "var(--gold)", textTransform: "uppercase", marginBottom: 7, display: "block" }}>Username</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">👤</span>
                <input className="auth-input-premium" type="text" placeholder="padhu" autoCapitalize="none" autoCorrect="off" autoComplete="off" value={user} onChange={e => setUser(e.target.value)} />
              </div>
            </div>
            <div className="auth-input-group" style={{ textAlign: "left", marginBottom: 25 }}>
              <label style={{ fontSize: 10, letterSpacing: 2, color: "var(--gold)", textTransform: "uppercase", marginBottom: 7, display: "block" }}>Password</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">🔒</span>
                <input className="auth-input-premium" type="password" placeholder="••••" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => { if (e.key === "Enter") document.getElementById("admin-login-btn")?.click() }} />
              </div>
            </div>
            <button id="admin-login-btn" className="auth-btn-submit" style={{ width: "100%" }} onClick={() => { if (user.toLowerCase().trim() === "padhu" && pass.trim() === "1234") { setUnlocked(true); showToast("✓ Admin Login Successful", "success"); } else showToast("✗ Wrong credentials", "processing"); }}>Access Dashboard</button>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 15, marginBottom: 28, background: "rgba(201,168,76,0.05)", padding: "14px 18px", borderRadius: 12, border: "1px solid rgba(201,168,76,0.15)" }}>
              <img src="/admin.png" alt="Admin" style={{ width: 48, height: 48, borderRadius: "50%", border: "2px solid var(--gold)", objectFit: "cover", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }} />
              <div style={{ flex: 1 }}>
                <div style={{ color: "#fff", fontSize: 15, fontWeight: 500, fontFamily: "'Cormorant Garamond', serif", letterSpacing: 0.5 }}>Padmasri Namala</div>
                <div style={{ color: "var(--gold)", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", marginTop: 2 }}>✦ System Administrator</div>
              </div>
              <button className="btn-close" style={{ fontSize: 11, padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,0.05)" }} onClick={() => { setUnlocked(false); setUser(""); setPass(""); }}>Logout</button>
            </div>

            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <h4>Total Revenue</h4>
                <div className="stat-value">₹{totalRevenue.toLocaleString("en-IN")}</div>
              </div>
              <div className="admin-stat-card">
                <h4>Total Bookings</h4>
                <div className="stat-value" style={{ color: "#fff" }}>{activeBookings.length}</div>
              </div>
              <div className="admin-stat-card">
                <h4>Action Needed</h4>
                <div className="stat-value" style={{ color: pendingCount > 0 ? "#f0a500" : "#4caf82" }}>{pendingCount} Pending</div>
              </div>
            </div>

            <div className="admin-charts-grid">
              <div className="admin-chart-box">
                <h3 className="admin-chart-title">Revenue Overview</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={val => '₹' + (val / 1000) + 'k'} />
                    <Tooltip cursor={{ fill: 'rgba(201,168,76,0.1)' }} contentStyle={{ background: 'rgba(26,26,38,0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 8, color: '#fff' }} itemStyle={{ color: '#c9a84c' }} />
                    <Bar dataKey="Revenue" fill="#c9a84c" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="admin-chart-box">
                <h3 className="admin-chart-title">Top Categories</h3>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'rgba(26,26,38,0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 8, color: '#fff' }} itemStyle={{ color: '#c9a84c' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center", color: "#888", fontSize: 13 }}>No bookings data</div>
                )}
              </div>
            </div>

            <div className="admin-event-manager">
              <h3>◈ Event Manager</h3>
              <div className="admin-event-form">
                <h4>{editIdx >= 0 ? "✦ Edit Event" : "✦ Add New Event"}</h4>
                <label className="aef-label">Event Name</label>
                <input className="aef-input" placeholder="e.g. Graduation Party" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                <label className="aef-label">Category / Tag</label>
                <input className="aef-input" placeholder="e.g. Milestone · Celebration" value={form.tag} onChange={e => setForm({ ...form, tag: e.target.value })} />
                <label className="aef-label">Image URL</label>
                <input className="aef-input" placeholder="https://...image.jpg" value={form.img} onChange={e => setForm({ ...form, img: e.target.value })} />
                <label className="aef-label">Status</label>
                <select className="aef-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="active">Active</option><option value="inactive">Inactive</option>
                </select>
                <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  <button className="btn-primary" onClick={saveEvent}>Save Event</button>
                  <button className="btn-close" style={{ padding: "14px 18px" }} onClick={() => { setForm({ name: "", tag: "", img: "", status: "active" }); setEditIdx(-1); }}>Reset</button>
                </div>
              </div>
              <div className="admin-events-list">
                <div className="admin-events-list-head"><h4>All Events</h4><span style={{ fontSize: 11, color: "var(--text-muted)" }}>{eventsData.length} events</span></div>
                {eventsData.map((e, i) => (
                  <div key={i} className="event-row">
                    <div className="event-row-top"><div className="event-row-name">{e.name}</div><div className={`event-row-status ${e.status}`}>{e.status === "active" ? "● Active" : "○ Inactive"}</div></div>
                    <div style={{ fontSize: 10, color: "var(--gold)", marginBottom: 10 }}>{e.tag}</div>
                    <div className="event-row-actions">
                      <button className="btn-edit" onClick={() => { setForm({ name: e.name, tag: e.tag, img: e.img, status: e.status }); setEditIdx(i); }}>Edit</button>
                      <button className="btn-toggle-status" onClick={() => { const d = [...eventsData]; d[i] = { ...d[i], status: d[i].status === "active" ? "inactive" : "active" }; setEventsData(d); }}>{e.status === "active" ? "Deactivate" : "Activate"}</button>
                      <button className="btn-del" onClick={() => { if (window.confirm('Delete "' + e.name + '"?')) setEventsData(p => p.filter((_, j) => j !== i)); }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 32 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                  <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 300, color: "var(--gold)", margin: 0 }}>◈ All Bookings</h3>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{bookings.length} bookings</span>
                </div>
                <button className="btn-primary" style={{ padding: "6px 14px", fontSize: 11 }} onClick={() => {
                  const out = "ID,Name,Phone,Event,Date,Shift,FoodType,Status,Total,Advance,Remaining,PayMode\n" + bookings.map(b => `"${b.id}","${b.name}","${b.phone}","${b.event}","${b.date}","${b.shift}","${b.foodType}","${b.status}","${b.price}","${b.advancePaid}","${b.remainingBalance}","${b.payMode}"`).join("\n");
                  const url = window.URL.createObjectURL(new Blob([out], { type: 'text/csv' }));
                  const a = document.createElement('a'); a.href = url; a.download = `bookings_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
                }}>Export CSV ⬇</button>
              </div>
              {bookings.length === 0 ? <div className="no-bookings">No bookings yet.</div> : bookings.map((b, i) => {
                const statusColors = { pending: "#f0a500", confirmed: "#c9a84c", completed: "#4caf82", cancelled: "#e05a5a" };
                const updateStatus = (newStatus) => {
                  // Update local state first for immediate UI response
                  setBookings(prev => prev.map(bk => bk.id === b.id ? { ...bk, status: newStatus } : bk));

                  // Persist to backend
                  fetch(`${API}/bookings/${b.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: newStatus })
                  })
                    .then(r => {
                      if (!r.ok) throw new Error(`Server Error: ${r.status}`);
                      showToast(`✓ BK-${b.id.toString().slice(-6)} moved to ${newStatus}`, "success");
                    })
                    .catch(err => {
                      console.error("❌ Persistence failed:", err);
                      showToast("⚠ Connection error — Not saved to database!", "processing", 5000);
                    });
                };
                return (
                  <div key={i} className="admin-booking-card">
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
                      <span style={{ color: "var(--gold)", fontSize: 11, fontFamily: "monospace" }}>{b.id}</span>
                      <span
                        onClick={() => {
                          if (b.status === "pending") updateStatus("confirmed");
                          else if (b.status === "confirmed") updateStatus("completed");
                        }}
                        style={{
                          fontSize: 10, color: statusColors[b.status] || "var(--gold)", padding: "3px 10px",
                          borderRadius: 20, border: `1px solid ${statusColors[b.status] || "rgba(201,168,76,.3)"}`,
                          background: `${statusColors[b.status]}18`, cursor: (b.status === "pending" || b.status === "confirmed") ? "pointer" : "default",
                          transition: "all 0.2s"
                        }}
                        title={b.status === "pending" ? "Click to Confirm" : b.status === "confirmed" ? "Click to Mark Completed" : ""}
                      >
                        {b.status}
                      </span>
                    </div>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, marginBottom: 3 }}>{b.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 3 }}>{b.event}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 3 }}>📅 {b.date} ({b.shift}) · ₹{typeof b.price === "number" ? b.price.toLocaleString("en-IN") : b.price}</div>
                    {b.foodType && (
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 4, background: b.foodType === "veg" ? "rgba(76,175,130,0.1)" : "rgba(224,90,90,0.1)", color: b.foodType === "veg" ? "#4caf82" : "#e05a5a", fontSize: 10, marginBottom: 8, border: `1px solid ${b.foodType === "veg" ? "rgba(76,175,130,0.2)" : "rgba(224,90,90,0.2)"}` }}>
                        {b.foodType === "veg" ? "🥬 Veg" : "🍗 Non-Veg"}
                      </div>
                    )}
                    <div style={{ background: "rgba(255,255,255,0.03)", padding: "10px 12px", borderRadius: 8, marginTop: 8, marginBottom: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
                        <div><span style={{ color: "var(--text-muted)", fontSize: 9, textTransform: "uppercase", letterSpacing: 1 }}>📍 Location</span><div style={{ fontSize: 12, color: "var(--gold)", marginTop: 2 }}>{b.venue}</div></div>
                        <div><span style={{ color: "var(--text-muted)", fontSize: 9, textTransform: "uppercase", letterSpacing: 1 }}>🏠 Address</span><div style={{ fontSize: 11, color: "#eee", marginTop: 2, fontStyle: "italic", lineHeight: 1.4 }}>{b.address || "Not provided"}</div></div>
                      </div>
                    </div>
                    {b.themeNumber && <div style={{ fontSize: 11, color: "var(--gold)", marginBottom: 3 }}>🎨 Theme Card: #{b.themeNumber}</div>}
                    <div style={{ fontSize: 10, color: "var(--gold)", marginBottom: 10, display: "flex", gap: 10 }}>
                      <span>Paid: ₹{b.advancePaid?.toLocaleString("en-IN") || 0}</span>
                      <span style={{ color: "#888" }}>Bal: ₹{b.remainingBalance?.toLocaleString("en-IN") || 0}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button className="btn-invoice" onClick={() => onOpenInvoice(b.id)}>📄 Invoice</button>
                      {b.status !== "confirmed" && b.status !== "completed" && (
                        <button onClick={() => updateStatus("confirmed")} style={{ fontSize: 11, padding: "6px 14px", borderRadius: 6, border: "1px solid #c9a84c", background: "rgba(201,168,76,0.1)", color: "#c9a84c", cursor: "pointer", fontFamily: "'Montserrat',sans-serif" }}>✓ Confirm</button>
                      )}
                      {b.status === "confirmed" && (
                        <button onClick={() => updateStatus("completed")} style={{ fontSize: 11, padding: "6px 14px", borderRadius: 6, border: "1px solid #4caf82", background: "rgba(76,175,130,0.1)", color: "#4caf82", cursor: "pointer", fontFamily: "'Montserrat',sans-serif" }}>✔ Complete</button>
                      )}
                      {b.status !== "cancelled" && b.status !== "completed" && (
                        <button onClick={() => { if (window.confirm('Cancel booking ' + b.id + '?')) updateStatus("cancelled"); }} style={{ fontSize: 11, padding: "6px 14px", borderRadius: 6, border: "1px solid #e05a5a", background: "rgba(224,90,90,0.1)", color: "#e05a5a", cursor: "pointer", fontFamily: "'Montserrat',sans-serif" }}>✕ Cancel</button>
                      )}
                      <button
                        onClick={() => {
                          if (window.confirm(`⚠ Absolutely delete booking ${b.id}? This cannot be undone.`)) {
                            setBookings(prev => prev.filter(bk => bk.id !== b.id));
                            fetch(`${API}/bookings/${b.id}`, { method: "DELETE" })
                              .then(r => {
                                if (!r.ok) throw new Error("Delete failed");
                                showToast(`🗑 BK-${b.id.toString().slice(-6)} destroyed`, "success");
                              })
                              .catch(err => {
                                console.error("❌ Delete failed:", err);
                                showToast("⚠ Failed to delete from database!", "processing");
                              });
                          }
                        }}
                        style={{ fontSize: 11, padding: "6px 14px", borderRadius: 6, border: "1px solid #777", background: "rgba(119,119,119,0.1)", color: "#999", cursor: "pointer", fontFamily: "'Montserrat',sans-serif" }}
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── REVIEWS MANAGER ── */}
            <div style={{ marginTop: 40, borderTop: "1px solid rgba(201,168,76,0.1)", paddingTop: 30 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 20 }}>
                <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 300, color: "var(--gold)", margin: 0 }}>◈ Reviews Manager</h3>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{adminReviews.length} feedback entries</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 15 }}>
                {adminReviews.length === 0 ? (
                  <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 30, color: "var(--text-muted)", fontSize: 14 }}>No reviews found in database.</div>
                ) : adminReviews.map((r, i) => (
                  <div key={r._id || i} style={{ background: "var(--surface3)", border: "1px solid rgba(201,168,76,0.12)", borderRadius: 8, padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ color: "gold", fontSize: 16 }}>{"★".repeat(r.stars)}</div>
                      <button className="btn-del" style={{ padding: "4px 10px", minHeight: 28, fontSize: 10 }} onClick={() => handleDeleteReview(r._id)}>Delete</button>
                    </div>
                    <div style={{ color: "#eee", fontSize: 13, lineHeight: 1.6, fontStyle: "italic" }}>"{r.text}"</div>
                    <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "var(--gold)", fontSize: 12, fontWeight: 500 }}>— {r.name}</span>
                      <span style={{ fontSize: 9, color: "var(--text-muted)" }}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ── REVIEWS ──
function Reviews({ bookings }) {
  const revealRef = useSectionReveal();
  const [stars, setStars] = useState(0); const [hov, setHov] = useState(0);
  const [name, setName] = useState(""); const [text, setText] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reviewIdx, setReviewIdx] = useState(0);
  const defaults = [{ name: "Rahul", text: "MomentO made our wedding unforgettable!", stars: 5 }, { name: "Priya", text: "Best event planning service. Everything was perfect.", stars: 5 }, { name: "Arjun", text: "Decoration and catering were amazing.", stars: 5 }];

  // Auto-slide testimonials
  useEffect(() => {
    const total = defaults.length + reviews.length;
    if (total <= 1) return;
    const timer = setInterval(() => {
      setReviewIdx(prev => (prev + 1) % total);
    }, 4500);
    return () => clearInterval(timer);
  }, [reviews]);

  // Load reviews from backend on mount
  useEffect(() => {
    fetch(`${API}/reviews`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setReviews(data.map(r => ({ name: r.name, text: r.text, stars: r.stars })));
      })
      .catch(err => console.error("❌ Could not load reviews:", err));
  }, []);

  const submitReview = () => {
    if (!name || !text || !stars) { showToast("✗ Fill name, review & select stars", "processing"); return; }

    // Check if user has a booking with the same name (case-insensitive)
    const hasBooking = bookings.some(b => b.name?.toLowerCase() === name.trim().toLowerCase());
    if (!hasBooking) {
      showToast("⚠ Review failed: No booking found with the name '" + name + "'.", "processing", 4000);
      return;
    }

    const newReview = { name, text, stars };
    // Save to MongoDB backend
    fetch(`${API}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReview)
    })
      .then(r => { if (!r.ok) throw new Error("Server error"); return r.json(); })
      .then(() => {
        setReviews(p => [...p, newReview]);
        setName(""); setText(""); setStars(0);
        showToast("🎉 Thank you, " + name + "!", "confirmed");
      })
      .catch(err => {
        console.error("❌ Review save failed:", err);
        // Still add locally so UI doesn't break
        setReviews(p => [...p, newReview]);
        setName(""); setText(""); setStars(0);
        showToast("⚠ Review saved locally — backend may be offline", "processing", 4000);
      });
  };

  return (
    <section id="rating" className="reviews-section section-reveal" ref={revealRef}>
      <div className="section-wrap">
        <div className="section-label">Testimonials</div>
        <h2 className="section-title">What Our <em>Clients Say</em></h2>
        <div className="reviews-slider-container">
          <div className="reviews-slider" style={{ transform: `translateX(-${reviewIdx * 100}%)` }}>
            {[...defaults, ...reviews].map((r, i) => (
              <div key={i} className="review-slide-item">
                <div className="review-card-premium">
                  <div className="quote-icon">“</div>
                  <p className="review-text">{r.text}</p>
                  <div className="review-meta">
                    <div className="stars-row">{"★".repeat(r.stars)}</div>
                    <div className="reviewer-name">— {r.name}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="slider-controls">
            {[...defaults, ...reviews].map((_, i) => (
              <button key={i} className={`slider-dot${reviewIdx === i ? " active" : ""}`} onClick={() => setReviewIdx(i)} />
            ))}
          </div>
        </div>
        <div className="rating-form-wrap">
          <h3>✦ Share Your Experience</h3>
          <p className="rating-form-desc">Did we make your moment special? Let the world know.</p>
          <div className="star-picker">
            {[1, 2, 3, 4, 5].map(v => <span key={v} className={(hov || stars) >= v ? "lit" : ""} onMouseEnter={() => setHov(v)} onMouseLeave={() => setHov(0)} onClick={() => setStars(v)}>★</span>)}
          </div>
          
          <div className="auth-input-group" style={{ textAlign: "left", marginBottom: 15 }}>
            <label style={{ fontSize: 10, letterSpacing: 2, color: "var(--gold-light)", textTransform: "uppercase", marginBottom: 8, display: "block" }}>Full Name</label>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">👤</span>
              <input className="auth-input-premium" type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
            </div>
          </div>

          <div className="auth-input-group" style={{ textAlign: "left", marginBottom: 25 }}>
            <label style={{ fontSize: 10, letterSpacing: 2, color: "var(--gold-light)", textTransform: "uppercase", marginBottom: 8, display: "block" }}>Your Review</label>
            <div className="auth-input-wrapper" style={{ alignItems: "flex-start", padding: "10px 0" }}>
              <span className="auth-input-icon" style={{ marginTop: 5 }}>✍</span>
              <textarea className="auth-input-premium" style={{ border: "none", background: "transparent", minHeight: 90, padding: "5px 14px", resize: "vertical" }} placeholder="Write your thoughts..." value={text} onChange={e => setText(e.target.value)} />
            </div>
          </div>
          
          <button className="auth-btn-submit" style={{ width: "100%", marginTop: "10px" }} onClick={submitReview}>Publish Review</button>
        </div>
      </div>
    </section>
  );
}

// ── WHY CHOOSE US ──
function WhyChooseUs() {
  const revealRef = useSectionReveal();
  const features = [
    { icon: "💎", title: "Premium Quality", desc: "Handpicked vendors with proven excellence — only the best for your special day." },
    { icon: "📅", title: "Easy Booking", desc: "Book your dream event in under 5 minutes — simple, fast, stress-free." },
    { icon: "💳", title: "No-Cost EMI", desc: "Split payments into 3 easy monthly installments — zero extra charge." },
    { icon: "🎯", title: "11+ Event Types", desc: "From intimate birthdays to grand weddings — we handle every celebration." },
    { icon: "📸", title: "Expert Vendors", desc: "Photographers, caterers, decorators & DJs — all under one roof." },
    { icon: "⭐", title: "98% Happy Clients", desc: "500+ events hosted with a 98% satisfaction rate — we deliver on promises." },
  ];
  return (
    <section id="why" className="why-section-premium section-reveal" ref={revealRef}>
      <div className="section-wrap">
        <div className="section-label">Our Promise</div>
        <h2 className="section-title">Why Choose <em>MomentO</em></h2>
        <div className="why-grid">
          {features.map((f, i) => (
            <div key={i} className="why-card-premium">
              <div className="why-icon-premium">{f.icon}</div>
              <h3 className="why-title-premium">{f.title}</h3>
              <p className="why-desc-premium">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── OUR TEAM ──
function OurTeam() {
  const revealRef = useSectionReveal();
  const team = [
    { initials: "PN", name: "Padhu N", role: "Lead Event Planner", exp: "8 yrs exp", gradient: "linear-gradient(135deg,#C9A84C,#b8923e)" },
    { initials: "NM", name: "Neha M", role: "Decor Specialist", exp: "6 yrs exp", gradient: "linear-gradient(135deg,#a855f7,#ec4899)" },
    { initials: "DG", name: "Devi G", role: "Photography Head", exp: "7 yrs exp", gradient: "linear-gradient(135deg,#3b82f6,#06b6d4)" },
    { initials: "IK", name: "Indhu K", role: "Catering Manager", exp: "5 yrs exp", gradient: "linear-gradient(135deg,#10b981,#34d399)" },
    { initials: "JM", name: "Jyothi M", role: "DJ & Entertainment", exp: "9 yrs exp", gradient: "linear-gradient(135deg,#ef4444,#f97316)" },
    { initials: "MA", name: "Mounika A", role: "Client Relations", exp: "4 yrs exp", gradient: "linear-gradient(135deg,#ec4899,#a855f7)" },
    { initials: "GA", name: "Gayatri A", role: "Marketing Head", exp: "6 yrs exp", gradient: "linear-gradient(135deg,#6366f1,#8b5cf6)" },
  ];
  return (
    <section id="team" className="team-section-premium section-reveal" ref={revealRef}>
      <div className="section-wrap">
        <div className="section-label">The People</div>
        <h2 className="section-title">Meet Our <em>Team</em></h2>
        <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 14, maxWidth: 520, margin: "0 auto 48px", lineHeight: 1.7 }}>
          Passionate professionals dedicated to making your celebration absolutely perfect.
        </p>
        <div className="team-grid-premium">
          {team.map((m, i) => (
            <div key={i} className="team-card-premium">
              <div className="team-avatar-premium" style={{ background: m.gradient }}>
                {m.initials}
              </div>
              <div className="team-name-premium">{m.name}</div>
              <div className="team-role-premium">{m.role}</div>
              <div className="team-exp-premium">{m.exp}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CONTACT ──
function Contact() {
  return (
    <section id="contact" className="contact-section-premium">
      <div className="section-wrap">
        <div className="section-label">Reach Us</div>
        <h2 className="section-title">Get in <em>Touch</em></h2>
        <div className="contact-grid">
          <div className="contact-card-premium">
            <div className="contact-icon-premium">✆</div>
            <div className="contact-type-premium">Phone</div>
            <div className="contact-val-premium"><a href="tel:+918106296055" style={{ color: "inherit", textDecoration: "none" }}>+91 81062 96055</a></div>
          </div>
          <div className="contact-card-premium">
            <div className="contact-icon-premium">✉</div>
            <div className="contact-type-premium">Email</div>
            <div className="contact-val-premium"><a href="mailto:momento.events@gmail.com" style={{ color: "inherit", textDecoration: "none" }}>momento.events@gmail.com</a></div>
          </div>
          <div className="contact-card-premium">
            <div className="contact-icon-premium">◎</div>
            <div className="contact-type-premium">Address</div>
            <div className="contact-val-premium">2nd Floor, MG Road<br />Rajahmundry, AP</div>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 60 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "var(--gold)", marginBottom: 20 }}>✦ Quick Enquiry</div>
          <a href={`https://wa.me/${WHATSAPP}?text=Hello%20MomentO!`} target="_blank" rel="noreferrer" className="whatsapp-btn-premium">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
            Chat on WhatsApp
          </a>
        </div>
      </div>
      <footer className="footer-premium">
        <div className="f-logo">MomentO</div>
        <div>© 2025 MomentO Premium Events · Rajahmundry, AP</div>
      </footer>
    </section>
  );
}

// ── THEME GALLERY MODAL ──
function ThemeGalleryModal({ event, onClose, onBookWithTheme }) {
  if (!event || (!event.themes || event.themes.length === 0)) {
    return (
      <div className="modal-overlay open" onClick={onClose}>
        <div className="modal-box" style={{ textAlign: "center", padding: "40px 20px" }} onClick={e => e.stopPropagation()}>
          <div className="sheet-handle" />
          <div className="section-label">Curating Excellence</div>
          <h3 style={{ fontFamily: "'Cormorant Garamond',serif", color: "#fff", marginTop: 15 }}>The {event?.name} Luxury Collection is being curated.</h3>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 10 }}>In the meantime, you can proceed with a direct custom booking.</p>
          <button className="btn-close" style={{ marginTop: 25, position: "static", width: "100%" }} onClick={onClose}>Understood</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal-box gallery-view" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="premium-gallery-header">
          <div className="section-label">Luxury Collection</div>
          <h2 className="modal-title">{event.name} <em>Themes</em></h2>
          <div className="modal-divider-gold" />
          <p>Select a curated theme to begin your extraordinary journey.</p>
        </div>

        <div className="theme-grid">
          {event.themes.map((t, i) => (
            <div 
              key={i} 
              className="theme-card reveal" 
              style={{ animationDelay: `${i * 0.1}s`, opacity: 1, transform: 'none' }}
              onClick={() => onBookWithTheme(t.num)}
            >
              <div className="theme-img-wrap">
                <img src={t.img} alt={`Theme ${t.num}`} loading="lazy" />
                <div className="theme-shine-overlay" />
                <div className="theme-price-badge">
                  <span className="tp-label">Premium Setup</span>
                  <span className="tp-val">₹{t.price?.toLocaleString("en-IN")}</span>
                </div>
              </div>
              <div className="theme-num-tag">#{t.num}</div>
              <div className="theme-select-overlay">
                <div className="ts-btn">Select Theme {t.num}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="modal-footer" style={{ marginTop: 30, paddingBottom: 20 }}>
          <button className="btn-close" style={{ position: "static", width: "100%", borderStyle: "dashed" }} onClick={onClose}>
            Explore Other Events
          </button>
        </div>
      </div>
    </div>
  );
}

// ── PAYMENT GATEWAY MOCK ──
function PaymentGatewayModal({ amount, bookingData, onPay, onClose }) {
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const formattedAmount = Number(amount).toFixed(2);

  const fireConfetti = () => {
    for (let i = 0; i < 120; i++) {
      const conf = document.createElement('div');
      conf.className = 'confetti-piece';
      conf.style.left = Math.random() * 100 + 'vw';
      conf.style.top = '-10px';
      conf.style.width = (Math.random() * 8 + 4) + 'px';
      conf.style.height = (Math.random() * 8 + 4) + 'px';
      conf.style.animationDuration = (Math.random() * 2 + 2) + 's';
      conf.style.animationDelay = Math.random() * 0.8 + 's';
      conf.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      conf.style.backgroundColor = ['#C9A84C', '#4caf82', '#a855f7', '#3b82f6', '#ec4899', '#ffffff'][Math.floor(Math.random() * 6)];
      conf.style.zIndex = '100000';
      conf.style.position = 'fixed';
      document.body.appendChild(conf);
      setTimeout(() => conf.remove(), 4000);
    }
  };

  const playSuccessSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const playNote = (freq, startTime, duration, vol) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(vol, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };
      const now = ctx.currentTime;
      playNote(587.33, now, 0.4, 0.1);       // D5
      playNote(739.99, now + 0.1, 0.4, 0.1); // F#5
      playNote(880.00, now + 0.2, 0.4, 0.1); // A5
      playNote(1174.66, now + 0.3, 0.8, 0.1);// D6
    } catch (e) { console.warn("Audio disabled:", e); }
  };

  const [method, setMethod] = useState("upi"); // 'online' or 'upi'
  const [txnId, setTxnId] = useState("");

  const upiLink = `upi://pay?pa=8106296055@ybl&pn=NAMALA%20PADMA%20SRI&am=${amount}&cu=INR&tn=Booking%20for%20${encodeURIComponent(bookingData.event || "Event")}`;
  const dynamicQR = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(upiLink)}`;

  const handleRazorpaySuccess = async (response) => {
    setProcessing(true);
    try {
      const res = await fetch(`${API}/payment/verify-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...response,
          bookingId: bookingData.id
        })
      });
      const data = await res.json();
      if (data.success) {
        setProcessing(false);
        setSuccess(true);
        fireConfetti();
        playSuccessSound();
        setTimeout(() => onPay(), 3000);
      } else {
        throw new Error(data.message || "Verification failed");
      }
    } catch (err) {
      setError(err.message);
      setProcessing(false);
    }
  };

  const submitManualUPI = async () => {
    if (!txnId.trim()) { showToast("✗ Please enter Transaction ID", "processing"); return; }
    setProcessing(true);
    try {
      // 1. First create the pending booking in DB
      const initRes = await fetch(`${API}/payment/create-pending-booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          bookingData
        })
      });
      const initData = await initRes.json();
      
      if (!initData.success) throw new Error(initData.error || initData.message || "Failed to initialize booking");

      // 2. Now submit the UPI Transaction ID linked to that bookingId
      const res = await fetch(`${API}/payment/submit-upi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: initData.bookingId, // User the NEWLY created BKxxxxxx ID
          upiTransactionId: txnId
        })
      });
      const data = await res.json();
      if (data.success) {
        setProcessing(false);
        setSuccess(true);
        fireConfetti();
        playSuccessSound();
        setTimeout(() => onPay(), 3000);
      } else {
        throw new Error(data.message || "Submission failed");
      }
    } catch (err) {
      setError(err.message);
      setProcessing(false);
    }
  };

  const initRazorpay = async () => {
    showToast("✦ Online Payment Gateway will be updated in the future. Stay tuned!", "processing", 5000);
  };

  return (
    <>
      <div className="modal-overlay open" onClick={onClose}>
        <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 420, textAlign: "center", padding: "30px 20px", display: "flex", flexDirection: "column", minHeight: 500 }}>
          <div className="sheet-handle" />
          
          {success ? (
            <div style={{ animation: "popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards", padding: "40px 0" }}>
              <div className="success-checkmark" style={{ width: 100, height: 100, margin: "0 auto 30px", position: "relative" }}>
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(76,175,130,0.1)", border: "2px solid #4caf82", animation: "pulseRing 1.5s infinite" }} />
                <svg fill="none" stroke="#4caf82" strokeWidth="4" viewBox="0 0 24 24" style={{ width: 60, height: 60, position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", strokeDasharray: 50, strokeDashoffset: 50, animation: "drawCheck 0.6s ease forwards 0.3s" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", color: "#4caf82", marginBottom: 15, fontSize: 32, letterSpacing: 1 }}>{method === 'upi' ? 'Request Submitted' : 'Payment Successful'}</h2>
              <p style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.6 }}>{method === 'upi' ? 'We are verifying your transaction. Your booking status will be updated shortly.' : 'Your payment was successful and your booking is confirmed.'}</p>
            </div>
          ) : error ? (
            <div style={{ padding: "40px 0" }}>
              <div style={{ color: "#e05a5a", fontSize: 50, marginBottom: 20 }}>✕</div>
              <h2 style={{ color: "#fff", marginBottom: 10 }}>Payment Failed</h2>
              <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 30 }}>{error}</p>
              <button className="btn-primary" style={{ width: "100%" }} onClick={() => setError("")}>Try Again</button>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 25 }}>
                <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "var(--gold)", marginBottom: 8 }}>✦ Payment Gateway</div>
                <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, color: "#fff" }}>Secure Checkout</h2>
                <div style={{ fontSize: 13, color: "var(--gold)", marginTop: 5, fontWeight: 600 }}>Amount: ₹{amount.toLocaleString("en-IN")}</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 30, background: "rgba(255,255,255,0.03)", padding: 5, borderRadius: 10, border: "1px solid rgba(201,168,76,0.1)" }}>
                <button className={`pay-m-btn${method === "online" ? " active" : ""}`} onClick={() => setMethod("online")} style={{ background: method === "online" ? "var(--gold)" : "transparent", color: method === "online" ? "#111" : "#888", border: "none", padding: "10px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "0.3s" }}>ONLINE PAY</button>
                <button className={`pay-m-btn${method === "upi" ? " active" : ""}`} onClick={() => setMethod("upi")} style={{ background: method === "upi" ? "var(--gold)" : "transparent", color: method === "upi" ? "#111" : "#888", border: "none", padding: "10px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "0.3s" }}>DIRECT UPI</button>
              </div>

              {method === "online" ? (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                   {processing ? (
                    <div style={{ padding: "30px 0" }}>
                      <div className="loading-spinner" style={{ margin: "0 auto 20px", display: "inline-block", width: 40, height: 40, border: "3px solid rgba(201,168,76,0.2)", borderRadius: "50%", borderTopColor: "var(--gold)", animation: "spin 1s ease-in-out infinite" }}></div>
                      <div style={{ color: "var(--gold)", fontSize: 11, letterSpacing: 2, textTransform: "uppercase" }}>Initializing Secure Gateway...</div>
                    </div>
                  ) : (
                    <>
                      <div style={{ padding: "20px", background: "rgba(201,168,76,0.05)", borderRadius: 12, border: "1px dashed rgba(201,168,76,0.3)", marginBottom: 25 }}>
                        <p style={{ fontSize: 12, color: "#aaa", lineHeight: 1.6 }}>Pay using Credit/Debit Cards, Netbanking, or any UPI App via Razorpay's secure portal.</p>
                      </div>
                      <button className="btn-pay" style={{ width: "100%", padding: "16px", borderRadius: 12, fontSize: 14 }} onClick={initRazorpay}>Pay Securely Now</button>
                    </>
                  )}
                </div>
              ) : (
                <div style={{ flex: 1, overflowY: "auto", paddingRight: 5 }}>
                  <div style={{ background: "#fff", padding: 12, borderRadius: 15, marginBottom: 15, maxWidth: 200, margin: "0 auto 20px", boxShadow: "0 15px 35px rgba(0,0,0,0.4)", position: "relative" }}>
                    <img id="qr-image" src={dynamicQR} alt="Payment QR Code" style={{ width: "100%", height: "auto", display: "block", borderRadius: 10 }} />
                    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 40, height: 40, background: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
                       <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" style={{ width: 25 }} />
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: 20, display: "flex", flexDirection: "column", gap: 5 }}>
                    <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase", letterSpacing: 1 }}>UPI ID: 8106296055@ybl</div>
                    <div style={{ fontSize: 18, color: "var(--gold)", fontWeight: 700 }}>₹{amount.toLocaleString("en-IN")}</div>
                    <div style={{ fontSize: 10, color: "#4caf82", fontWeight: 600 }}>✦ Amount Preset Enabled</div>
                  </div>

                  <a href={upiLink} className="btn-pay" style={{ width: "100%", padding: "12px", borderRadius: 10, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, textDecoration: "none", marginBottom: 20, background: "linear-gradient(to right, #C9A84C, #A8893A)" }}>
                    <span>📱</span> Pay via UPI App
                  </a>

                  <div className="auth-input-group" style={{ textAlign: "left", marginBottom: 20 }}>
                    <label style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 8, display: "block" }}>Enter Transaction ID (UTR)</label>
                    <div className="auth-input-wrapper">
                      <span className="auth-input-icon">📜</span>
                      <input 
                        className="auth-input-premium" 
                        type="text" 
                        placeholder="12-digit Number" 
                        value={txnId} 
                        onChange={e => setTxnId(e.target.value)} 
                        style={{ border: "1px solid rgba(201,168,76,0.1)" }}
                      />
                    </div>
                  </div>

                  <button 
                    className="btn-pay" 
                    disabled={processing}
                    style={{ width: "100%", padding: "14px", borderRadius: 10, fontSize: 13, background: processing ? "#333" : "rgba(255,255,255,0.05)", border: "1px solid var(--gold)", color: processing ? "#888" : "var(--gold)" }} 
                    onClick={submitManualUPI}
                  >
                    {processing ? "SUBMITTING..." : "Confirm Payment"}
                  </button>
                  <p style={{ fontSize: 9, color: "#555", marginTop: 15 }}>Payment will be verified within 2 hours.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes drawCheck { to { stroke-dashoffset: 0; } }
        @keyframes popIn { 0% { opacity: 0; transform: scale(0.5); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes pulseRing { 0% { transform: scale(0.95); opacity: 0.5; } 50% { transform: scale(1); opacity: 0.2; } 100% { transform: scale(0.95); opacity: 0.5; } }
        @keyframes fadeInOut { 0% { opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { opacity: 0; } }
      `}</style>
    </>
  );
}


// ── BOOKING MODAL ──
function BookingModal({ event, loggedInUser, onClose, onConfirm, bookings = [] }) {
  const [pendingBooking, setPendingBooking] = useState(null);
  const [name, setName] = useState(loggedInUser?.name || "");
  const [phone, setPhone] = useState(loggedInUser?.phone || "");
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");
  const [address, setAddress] = useState("");
  const [guests, setGuests] = useState("100"); // Default guests for calculation
  const [payMode, setPayMode] = useState("advance");
  const [shift, setShift] = useState("morning");
  const [special, setSpecial] = useState("");
  const [theme, setTheme] = useState("");
  const [themeNum, setThemeNum] = useState(loggedInUser?.preSelectedThemeNum || "");
  const [foodType, setFoodType] = useState("veg");
  const themes = [
    { name: "Royal Gold", gradient: "linear-gradient(135deg,#C9A84C,#8B6914)" },
    { name: "Pastel Pink", gradient: "linear-gradient(135deg,#ec4899,#f9a8d4)" },
    { name: "Midnight Blue", gradient: "linear-gradient(135deg,#1e3a5f,#3b82f6)" },
    { name: "Garden Green", gradient: "linear-gradient(135deg,#166534,#4ade80)" },
    { name: "Royal Purple", gradient: "linear-gradient(135deg,#7c3aed,#c084fc)" },
    { name: "Ruby Red", gradient: "linear-gradient(135deg,#dc2626,#fca5a5)" },
    { name: "Teal Breeze", gradient: "linear-gradient(135deg,#0f766e,#5eead4)" },
    { name: "Sunset", gradient: "linear-gradient(135deg,#92400e,#fcd34d)" },
  ];
  const [selected, setSelected] = useState([]);

  const guestNum = parseInt(guests) || 0;
  const total = selected.reduce((a, s) => {
    if (s.vegPrice || s.nonVegPrice) {
      const p = foodType === "veg" ? s.vegPrice : s.nonVegPrice;
      return a + (p * guestNum);
    }
    return a + (s.price || 0);
  }, 0);

  const themePrice = event.themes?.find(t => t.num == themeNum)?.price || 0;
  const grandTotal = total + themePrice;
  const advance = Math.ceil(grandTotal * 0.3);
  const balance = grandTotal - advance;
  const emi = Math.ceil(balance / 3);
  const services = eventServices[event?.name] || [];
  const hasCateringSupport = services.some(s => s.vegPrice || s.nonVegPrice);
  const toggle = (s) => setSelected(p => p.find(x => x.name === s.name) ? p.filter(x => x.name !== s.name) : [...p, s]);

  const pay = () => {
    if (!name || !phone || !date || !venue || !address || (!selected.length && !themeNum)) {
      showToast("⚠ Please fill in all mandatory fields (Name, Phone, Date, Location, and Address) and select at least one service or theme.", "processing", 5000);
      return;
    }

    if (phone.length !== 10) {
      showToast("⚠ Phone number must be exactly 10 digits.", "processing");
      return;
    }

    // Check if date and shift is already booked
    const isBooked = bookings.some(b => b.date === date && b.shift === shift && b.status !== "cancelled");
    if (isBooked) {
      showToast(`✗ The ${shift} shift on this date is already booked.`, "processing");
      return;
    }

    const b = {
      id: "BK" + Date.now().toString().slice(-6),
      name, phone, event: event.name, date, venue, address, guests, special, theme,
      themeNumber: themeNum,
      services: selected.map(s => s.name).join(", "),
      price: grandTotal, // 100% Total
      advancePaid: advance, // 30% Advance
      remainingBalance: balance, // 70% Balance
      status: "pending",
      payMode: payMode === "advance" ? "30% Advance + 70% Balance" : payMode === "emi" ? `30% Adv + EMI ₹${emi.toLocaleString("en-IN")}×3` : "Full Payment",
      userEmail: loggedInUser ? loggedInUser.email : "",
      shift: shift,
      foodType: foodType
    };

    setPendingBooking(b);
  };

  if (pendingBooking) {
    return (
      <PaymentGatewayModal
        amount={payMode === "advance" || payMode === "emi" ? advance : grandTotal}
        bookingData={pendingBooking}
        onPay={() => {
          fetch(`${API}/bookings`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bookingId: pendingBooking.id,
              name: pendingBooking.name,
              phone: pendingBooking.phone,
              event: pendingBooking.event,
              date: pendingBooking.date,
              venue: pendingBooking.venue,
              address: pendingBooking.address,
              guests: pendingBooking.guests,
              special: pendingBooking.special,
              theme: pendingBooking.theme,
              themeNumber: pendingBooking.themeNumber,
              services: pendingBooking.services,
              price: pendingBooking.price,
              advancePaid: pendingBooking.advancePaid,
              remainingBalance: pendingBooking.remainingBalance,
              status: pendingBooking.status,
              payMode: pendingBooking.payMode,
              userEmail: pendingBooking.userEmail,
              shift: pendingBooking.shift,
              foodType: pendingBooking.foodType
            })
          }).catch(err => console.error("❌ Booking save failed:", err));
          onConfirm(pendingBooking);
          onClose();
          showToast(`✨ ${pendingBooking.name}, your ${pendingBooking.event} booking is successful!`, "confirmed", 6000);
        }}
        onClose={() => setPendingBooking(null)}
      />
    );
  }

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="modal-header">
          <div className="modal-eyebrow">✦ Reservation</div>
          <div className="modal-title">Book {event?.name}</div>
        </div>
        <div className="modal-body">
          <input className="modal-input" type="text" placeholder="Your Full Name" value={name} onChange={e => setName(e.target.value)} />
          <input className="modal-input" type="tel" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} />
          <input className="modal-input" type="number" placeholder="Estimated Guest Count" value={guests} onChange={e => setGuests(e.target.value)} />
          <input className="modal-input" type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split("T")[0]} />

          { (hasCateringSupport && selected.some(s => s.vegPrice || s.nonVegPrice)) && (
            <div style={{ marginBottom: 25 }}>
              <div className="services-title">✦ Catering Preference</div>
              <div style={{ 
                background: "rgba(255,255,255,0.02)", 
                border: "1px solid rgba(201,168,76,0.15)", 
                borderRadius: "12px", 
                overflow: "hidden" 
              }}>
                <div 
                  className="service-item" 
                  onClick={() => setFoodType("veg")}
                  style={{ 
                    padding: "16px", 
                    cursor: "pointer", 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 15,
                    background: foodType === "veg" ? "rgba(201,168,76,0.08)" : "transparent",
                    transition: "0.3s"
                  }}
                >
                  <div style={{ 
                    width: 22, height: 22, borderRadius: "50%", 
                    border: foodType === "veg" ? "2px solid var(--gold)" : "2px solid rgba(255,255,255,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                  }}>
                    {foodType === "veg" && <div style={{ width: 10, height: 10, background: "var(--gold)", borderRadius: "50%" }} />}
                  </div>
                  <label style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                    <span style={{ fontSize: 20 }}>🥬</span>
                    <span style={{ fontSize: 13, fontWeight: foodType === "veg" ? 600 : 400, color: foodType === "veg" ? "#fff" : "var(--text-muted)" }}>Pure Vegetarian Menu</span>
                  </label>
                  {foodType === "veg" && <span style={{ fontSize: 10, color: "var(--gold)", fontWeight: 700, letterSpacing: 1 }}>SELECTED</span>}
                </div>

                <div style={{ height: "1px", background: "rgba(201,168,76,0.1)" }} />

                <div 
                  className="service-item" 
                  onClick={() => setFoodType("non_veg")}
                  style={{ 
                    padding: "16px", 
                    cursor: "pointer", 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 15,
                    background: foodType === "non_veg" ? "rgba(201,168,76,0.08)" : "transparent",
                    transition: "0.3s"
                  }}
                >
                  <div style={{ 
                    width: 22, height: 22, borderRadius: "50%", 
                    border: foodType === "non_veg" ? "2px solid var(--gold)" : "2px solid rgba(255,255,255,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                  }}>
                    {foodType === "non_veg" && <div style={{ width: 10, height: 10, background: "var(--gold)", borderRadius: "50%" }} />}
                  </div>
                  <label style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                    <span style={{ fontSize: 20 }}>🍗</span>
                    <span style={{ fontSize: 13, fontWeight: foodType === "non_veg" ? 600 : 400, color: foodType === "non_veg" ? "#fff" : "var(--text-muted)" }}>Non-Vegetarian Menu</span>
                  </label>
                  {foodType === "non_veg" && <span style={{ fontSize: 10, color: "var(--gold)", fontWeight: 700, letterSpacing: 1 }}>SELECTED</span>}
                </div>
              </div>
            </div>
          )}

          {/* Menu Preview Section */}
          {(() => {
            const selectedCatering = selected.find(s => s.vegPrice || s.nonVegPrice);
            if (!selectedCatering) return null;

            // Determine Category
            let category = "buffet";
            const sName = selectedCatering.name.toLowerCase();
            const eName = event?.name?.toLowerCase() || "";

            if (sName.includes("high tea") || sName.includes("cookies")) category = "high_tea";
            else if (sName.includes("lunch box")) category = "lunch_box";
            else if (sName.includes("youth") || sName.includes("snack") || sName.includes("fast food") || 
                     eName.includes("fest") || eName.includes("concert") || eName.includes("farewell")) category = "youth";

            const menu = categorizedMenus[category][foodType];
            const title = category.replace("_", " ").toUpperCase();

            return (
              <div style={{ padding: 14, background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 10, marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "var(--gold)", letterSpacing: 1, textTransform: "uppercase" }}>✦ {title} Menu Preview</span>
                  <span style={{ fontSize: 9, color: "var(--text-muted)" }}>{menu.length} Items Included</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 15px" }}>
                  {menu.map((item, idx) => (
                    <div key={idx} style={{ fontSize: 11, color: "#eee", display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ color: "var(--gold)", fontSize: 8 }}>✦</span> {item.replace(/🥬 |🍗 /, "")}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px dashed rgba(201,168,76,0.15)", fontSize: 10, color: "var(--gold)", fontStyle: "italic", textAlign: "center" }}>
                  "Want to swap items? Mention below in Special Requirements!"
                </div>
              </div>
            );
          })()}

          <select
            className="modal-input"
            value={venue}
            onChange={e => setVenue(e.target.value)}
            style={{ appearance: "none", cursor: "pointer" }}
          >
            <option value="" disabled>📍 Select Venue / Location</option>
            <option value="Rajahmundry (City)">Rajahmundry (City)</option>
            <option value="Kadiyam">Kadiyam</option>
            <option value="Dowleswaram">Dowleswaram</option>
            <option value="Bommuru">Bommuru</option>
            <option value="Morampudi">Morampudi</option>
            <option value="Diwancheruvu">Diwancheruvu</option>
            <option value="Lalacheruvu">Lalacheruvu</option>
            <option value="Hukumpeta">Hukumpeta</option>
            <option value="Torredu">Torredu</option>
            <option value="Venkatapuram">Venkatapuram</option>
            <option value="Kolamuru">Kolamuru</option>
            <option value="Nidadavole">Nidadavole</option>
            <option value="Other Location">Other Location</option>
          </select>
          {venue === "Other Location" && (
            <input
              className="modal-input"
              type="text"
              placeholder="Enter Specific Location"
              onChange={e => setVenue(e.target.value)}
              autoFocus
            />
          )}
          <textarea className="modal-input" placeholder="🏠 Exact Full Address (House No, Street, Landmark)" value={address} onChange={e => setAddress(e.target.value)} rows={2} style={{ resize: "none" }} />

          <div className="services-title">Select Shift</div>
          <div className="shift-selector">
            <button className={`shift-btn${shift === "morning" ? " active" : ""}`} onClick={() => setShift("morning")}>
              <span>☀️ Morning</span>
              <span className="shift-time">8 AM - 3 PM</span>
            </button>
            <button className={`shift-btn${shift === "night" ? " active" : ""}`} onClick={() => setShift("night")}>
              <span>🌙 Night</span>
              <span className="shift-time">6 PM - 11 PM</span>
            </button>
            <button className={`shift-btn${shift === "midnight" ? " active" : ""}`} onClick={() => setShift("midnight")}>
              <span>✨ Midnight</span>
              <span className="shift-time">11 PM - 3 AM</span>
            </button>
          </div>

          <div className="services-title">Select Services</div>
          <div style={{ maxHeight: 180, overflowY: "auto", paddingRight: 5, marginBottom: 15 }}>
            {services.map((s, i) => {
              const sel = selected.find(x => x.name === s.name);
              const pricePerPlate = foodType === "veg" ? s.vegPrice : s.nonVegPrice;
              const displayPrice = (s.vegPrice || s.nonVegPrice) ? pricePerPlate * guestNum : s.price;
              return (
                <div key={i} className="service-item" onClick={() => toggle(s)}>
                  <div className={`service-cb${sel ? " checked" : ""}`}>{sel ? "✓" : ""}</div>
                  <label>{s.name} {(s.vegPrice || s.nonVegPrice) ? `(₹${pricePerPlate}/plate)` : ""}</label>
                  <span className="price-tag">₹{displayPrice.toLocaleString("en-IN")}</span>
                </div>
              );
            })}
          </div>

          <div className="services-title">Special Requirements</div>
          <div style={{ fontSize: 10, color: "var(--gold)", marginBottom: 8, opacity: 0.8 }}>💡 Tip: Mention your favorite custom dishes or menu changes here.</div>
          <textarea className="modal-input" placeholder="e.g. Add Extra Starters, Change Sweet to Kheer, etc." value={special} onChange={e => setSpecial(e.target.value)} style={{ minHeight: 60, paddingTop: 12 }} />

          <div className="services-title">Decoration Theme Number</div>
          <div className="theme-num-box">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Current selection:</span>
              <span style={{ fontSize: 13, color: "var(--gold)", fontWeight: 600 }}>{themeNum ? `Theme #${themeNum}` : "None"}</span>
            </div>
            <div className="theme-num-selector">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <button key={n} className={`t-num-btn${themeNum == n ? " active" : ""}`} onClick={() => setThemeNum(n.toString())}>{n}</button>
              ))}
            </div>
            <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 8 }}>Tip: Click the event image in the events section to view photos for each theme number.</p>
          </div>

          <div className="total-bar" style={{ background: "rgba(201,168,76,0.08)" }}>
            <div className="total-label">Total Amount</div>
            <div className="total-amount">₹{grandTotal.toLocaleString("en-IN")}</div>
          </div>

          {total > 0 && (
            <div style={{ marginTop: 15 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 11, color: "var(--gold)" }}>Mandatory Advance (30%)</span>
                <span style={{ fontSize: 13, color: "var(--gold)", fontWeight: 600 }}>₹{advance.toLocaleString("en-IN")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 15 }}>
                <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Remaining Balance</span>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>₹{balance.toLocaleString("en-IN")}</span>
              </div>

              <div className="pkg-emi-toggle" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                <button className={`emi-opt${payMode === "advance" ? " active" : ""}`} onClick={() => setPayMode("advance")}>30% Adv</button>
                <button className={`emi-opt${payMode === "emi" ? " active" : ""}`} onClick={() => setPayMode("emi")}>EMI 3-Mo</button>
                <button className={`emi-opt${payMode === "full" ? " active" : ""}`} onClick={() => setPayMode("full")}>Full Pay</button>
              </div>

              {payMode === "emi" && (
                <div style={{ padding: "10px 14px", background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.25)", borderRadius: 6, margin: "14px 0 0", fontSize: 11, color: "var(--gold)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span>Advance Today (30%):</span> <strong>₹{advance.toLocaleString("en-IN")}</strong></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span>Next 3 Months:</span> <strong style={{ color: "#a855f7" }}>₹{emi.toLocaleString("en-IN")} /mo</strong></div>
                </div>
              )}

              <div className="policy-notice" style={{ marginTop: 12, padding: "10px", borderRadius: 6, background: "rgba(224,90,90,0.05)", border: "1px solid rgba(224,90,90,0.2)", color: "#e05a5a", fontSize: 10, textAlign: "center" }}>
                ⚠️ <strong>Cancellation Policy:</strong> 30% Advance is strictly non-refundable once the booking is confirmed.
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn-pay" onClick={pay}>Confirm & Pay</button>
          <button className="btn-close" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── PACKAGE MODAL ──
function PkgModal({ pkg, loggedInUser, onClose, onConfirm, bookings = [] }) {
  const [pendingBooking, setPendingBooking] = useState(null);
  const [name, setName] = useState(loggedInUser?.name || "");
  const [phone, setPhone] = useState(loggedInUser?.phone || "");
  const [date, setDate] = useState("");
  const [shift, setShift] = useState("morning");
  const total = pkg.num || 0;
  const advance = Math.ceil(total * 0.3);
  const balance = total - advance;

  const confirm = () => {
    if (!name || !phone || !date) { showToast("✗ Fill all details", "processing"); return; }

    const isBooked = bookings.some(b => b.date === date && b.shift === shift && b.status !== "cancelled");
    if (isBooked) {
      showToast(`✗ The ${shift} shift on this date is already booked.`, "processing");
      return;
    }

    const b = {
      id: "BK" + Date.now().toString().slice(-6),
      name, phone, event: pkg.name + " Package", date,
      services: "Package Booking",
      price: total, // 100% Total
      advancePaid: advance, // 30% Advance
      remainingBalance: balance, // 70% Balance
      status: "pending",
      payMode: "30% Advance Payment",
      userEmail: loggedInUser?.email || "guest",
      shift: shift
    };

    setPendingBooking(b);
  };

  if (pendingBooking) {
    return (
      <PaymentGatewayModal
        amount={advance}
        bookingData={pendingBooking}
        onPay={() => {
          fetch(`${API}/bookings`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bookingId: pendingBooking.id,
              name: pendingBooking.name,
              phone: pendingBooking.phone,
              event: pendingBooking.event,
              date: pendingBooking.date,
              services: pendingBooking.services,
              price: pendingBooking.price,
              advancePaid: pendingBooking.advancePaid,
              remainingBalance: pendingBooking.remainingBalance,
              status: pendingBooking.status,
              payMode: pendingBooking.payMode,
              userEmail: pendingBooking.userEmail,
              shift: pendingBooking.shift
            })
          }).catch(err => console.error("❌ Pkg booking failed:", err));
          onConfirm(pendingBooking);
          onClose();
          showToast("⏳ Package Secured! Invoice Generated.", "confirmed", 5000);
        }}
        onClose={() => setPendingBooking(null)}
      />
    );
  }

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="pkg-modal-top">
          <div style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "var(--gold)", marginBottom: 8 }}>✦ Package Booking</div>
          <div className="pkg-name">{pkg?.name}</div>
          <div className="pkg-price">{pkg?.price}</div>
        </div>
        <div className="pkg-modal-body">
          <div className="pkg-emi">30% Advance: <strong>₹{advance.toLocaleString("en-IN")}</strong> — Required to secure date</div>
          <input className="pkg-input" type="text" placeholder="Your Full Name" value={name} onChange={e => setName(e.target.value)} />
          <input className="pkg-input" type="tel" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} />
          <input className="pkg-input" type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split("T")[0]} />

          <div className="services-title">Select Shift</div>
          <div className="shift-selector">
            <button className={`shift-btn${shift === "morning" ? " active" : ""}`} onClick={() => setShift("morning")}>
              <span>☀️ Morning</span>
              <span className="shift-time">8 AM - 3 PM</span>
            </button>
            <button className={`shift-btn${shift === "night" ? " active" : ""}`} onClick={() => setShift("night")}>
              <span>🌙 Night</span>
              <span className="shift-time">6 PM - 11 PM</span>
            </button>
            <button className={`shift-btn${shift === "midnight" ? " active" : ""}`} onClick={() => setShift("midnight")}>
              <span>✨ Midnight</span>
              <span className="shift-time">11 PM - 3 AM</span>
            </button>
          </div>

          <div className="services-title">Select Shift</div>
          <div className="shift-selector">
            <button className={`shift-btn${shift === "morning" ? " active" : ""}`} onClick={() => setShift("morning")}>
              <span>☀️ Morning</span>
              <span className="shift-time">8 AM - 3 PM</span>
            </button>
            <button className={`shift-btn${shift === "night" ? " active" : ""}`} onClick={() => setShift("night")}>
              <span>🌙 Night</span>
              <span className="shift-time">6 PM - 11 PM</span>
            </button>
            <button className={`shift-btn${shift === "midnight" ? " active" : ""}`} onClick={() => setShift("midnight")}>
              <span>✨ Midnight</span>
              <span className="shift-time">11 PM - 3 AM</span>
            </button>
          </div>

          <div style={{ marginTop: 15, background: "rgba(201,168,76,0.04)", padding: 12, borderRadius: 8, border: "1px solid rgba(201,168,76,0.1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Advance Paid</span>
              <span style={{ fontSize: 12, color: "var(--gold)" }}>₹{advance.toLocaleString("en-IN")}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Pay On Event Day</span>
              <span style={{ fontSize: 12, color: "#fff" }}>₹{balance.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div className="policy-notice" style={{ marginTop: 15, padding: "10px", borderRadius: 6, background: "rgba(224,90,90,0.05)", border: "1px solid rgba(224,90,90,0.2)", color: "#e05a5a", fontSize: 10, textAlign: "center" }}>
            ⚠️ <strong>Policy:</strong> Advance is non-refundable upon cancellation.
          </div>
        </div>
        <div className="pkg-modal-footer">
          <button className="btn-book-pkg" onClick={confirm}>Pay Advance & Book</button>
          <button className="btn-close" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── GALLERY ──
function Gallery() {
  const [idx, setIdx] = useState(0);
  const touchStart = useRef(0);
  const IMGS = [
    "https://i.pinimg.com/1200x/88/b9/13/88b91315550eddddde352a7c3764cfc1.jpg",
    "https://i.pinimg.com/1200x/bd/fc/27/bdfc27350c27ffe77e740171400824cd.jpg",
    "https://i.pinimg.com/1200x/ea/15/28/ea1528ef6bea2c627acc6995d4a554d1.jpg",
    "https://i.pinimg.com/736x/ea/6e/f2/ea6ef278844fec6a1bdfe2a4d97014cb.jpg",
    "https://i.pinimg.com/736x/56/10/eb/5610eb710a1505cd5efb1b956e007278.jpg",
    "https://i.pinimg.com/1200x/2e/df/c8/2edfc813f5699684e2fd0b97d4a61040.jpg",
    "https://i.pinimg.com/1200x/37/02/d3/3702d3ea28786c2b219b98659bccac64.jpg",
  ];

  useEffect(() => {
    const t = setInterval(() => setIdx(p => (p + 1) % IMGS.length), 4500);
    return () => clearInterval(t);
  }, [IMGS.length]);

  return (
    <section id="gallery" className="gallery-section">
      <div className="section-wrap">
        <div className="section-label">Our Gallery</div>
        <h2 className="section-title">Event <em>Memories</em></h2>
        <div className="slider"
          onTouchStart={e => touchStart.current = e.changedTouches[0].screenX}
          onTouchEnd={e => {
            const d = touchStart.current - e.changedTouches[0].screenX;
            if (Math.abs(d) > 40) setIdx(p => d > 0 ? (p + 1) % IMGS.length : (p - 1 + IMGS.length) % IMGS.length);
          }}>
          <div className="slides" style={{ transform: `translateX(-${idx * 100}%)` }}>
            {IMGS.map((src, i) => <img key={i} src={src} alt={`gallery-${i}`} loading="lazy" />)}
          </div>
          <button className="prev" onClick={() => setIdx(p => (p - 1 + IMGS.length) % IMGS.length)}>&#10094;</button>
          <button className="next" onClick={() => setIdx(p => (p + 1) % IMGS.length)}>&#10095;</button>
        </div>
        <div className="dots">
          {IMGS.map((_, i) => <span key={i} className={i === idx ? "active" : ""} onClick={() => setIdx(i)} />)}
        </div>
      </div>
    </section>
  );
}

// ── INVOICE MODAL ──
function InvoiceModal({ bookingId, bookings, isAdminView, onClose }) {
  const b = bookings.find(x => x.id === bookingId);
  if (!b) return null;

  const WHATSAPP = "8106296055"; // Business Phone
  const targetPhone = isAdminView ? WHATSAPP : (b.phone?.toString().startsWith('91') ? b.phone : '91' + b.phone);
  const message = `${isAdminView ? 'Admin Copy of Invoice\n' : ''}Hello *${b.name}* ! ✨

Your booking for *${b.event}* on *${b.date}* is *Confirmed*! ✅

*Payment Summary:*
✦ Total Amount (100%): ₹${typeof b.price === "number" ? b.price.toLocaleString("en-IN") : b.price}
✦ Advance Paid (30%): ₹${b.advancePaid?.toLocaleString("en-IN") || "0"}
✦ Remaining Balance (70%): ₹${b.remainingBalance?.toLocaleString("en-IN") || "0"}

*Booking Details:*
✦ ID: *#${b.id}*
✦ Event: *${b.event}*
✦ Date: *${b.date}* (${b.shift})

Thank you for choosing *MomentO Events* ! 🙏`;

  return (
    <div className="invoice-modal-overlay open" onClick={onClose}>
      <div className="invoice-box" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" style={{ background: "rgba(0,0,0,.15)" }} />
        <div className="invoice-header"><div className="invoice-logo">MomentO</div><div className="invoice-sub">Premium Event Planning • Official Invoice</div></div>
        <div className="invoice-body">
          <div className="invoice-meta">
            <div className="invoice-meta-block"><h5>Billed To</h5><p>{b.name}</p><p style={{ color: "#888", fontSize: 11, marginTop: 2 }}>{b.phone || ""}</p></div>
            <div className="invoice-meta-block" style={{ textAlign: "right" }}><h5>Invoice No.</h5><p className="invoice-id">#{b.id}</p><p style={{ fontSize: 11, color: "#888", marginTop: 2 }}>Event Date: {b.date} ({b.shift})</p></div>
          </div>
          <table className="invoice-items">
            <thead><tr><th>Description</th><th>Details</th><th style={{ textAlign: "right" }}>Amount</th></tr></thead>
            <tbody>
              <tr><td>{b.event}</td><td>{b.date}</td><td>₹{typeof b.price === "number" ? b.price.toLocaleString("en-IN") : b.price}</td></tr>
              {b.themeNumber && (
                <tr>
                  <td>Decoration Theme</td>
                  <td>Theme #{b.themeNumber}</td>
                  <td style={{ textAlign: "right" }}>Included</td>
                </tr>
              )}
              {b.services && b.services.split(", ").map((s, i) => (
                <tr key={i}><td colSpan={2} style={{ paddingLeft: 10, fontSize: 11, color: "#666" }}>• {s}</td><td style={{ textAlign: "right", fontSize: 11, color: "#666" }}>Included</td></tr>
              ))}
              <tr><td colSpan={2} style={{ color: "#888", fontSize: 10, paddingTop: 15 }}>Payment Summary</td><td></td></tr>
              <tr style={{ border: "none" }}><td colSpan={2} style={{ paddingLeft: 20 }}>✦ Advance Paid (30%)</td><td style={{ textAlign: "right" }}>₹{b.advancePaid?.toLocaleString("en-IN") || "—"}</td></tr>
              <tr style={{ border: "none" }}><td colSpan={2} style={{ paddingLeft: 20 }}>✦ Remaining Balance (70%)</td><td style={{ textAlign: "right" }}>₹{b.remainingBalance?.toLocaleString("en-IN") || "—"}</td></tr>
            </tbody>
          </table>
          <div className="invoice-total-row"><div className="it-label">Grand Total</div><div className="it-amount">₹{typeof b.price === "number" ? b.price.toLocaleString("en-IN") : b.price}</div></div>

          <div className="policy-disclaimer" style={{ marginTop: 20, padding: 12, border: "1px dashed rgba(224,90,90,0.3)", borderRadius: 8, background: "rgba(224,90,90,0.02)" }}>
            <div style={{ fontSize: 10, color: "#e05a5a", fontWeight: "bold", textTransform: "uppercase", marginBottom: 4 }}>Notice: Non-Refundable Policy</div>
            <div style={{ fontSize: 9, color: "#888", lineHeight: 1.5 }}>
              The 30% advance payment (₹{b.advancePaid?.toLocaleString("en-IN")}) is strictly non-refundable once the date is secured. This policy ensures availability for all clients.
            </div>
          </div>

          <div style={{ textAlign: "center", margin: "16px 0" }}><span className="status-badge confirmed">✦ {b.status}</span></div>
          <div className="invoice-footer-note">Thank you for choosing MomentO Premium Events · Rajahmundry, AP<br />📞 +91 81062 96055 · ✉ momento.events@gmail.com</div>
        </div>
        <div className="invoice-actions no-print">
          <button className="btn-download-invoice" onClick={() => window.print()}>⬇ Download / Print</button>
          <a 
            href={`https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`} 
            target="_blank" 
            rel="noreferrer" 
            className="btn-whatsapp-premium-action"
          >
            <svg style={{ verticalAlign: "middle", marginRight: 8 }} width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
            Send Invoice on WhatsApp
          </a>
          <button className="btn-close-invoice" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ── BACK TO TOP ──
function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => { const fn = () => setShow(window.scrollY > 300); window.addEventListener("scroll", fn, { passive: true }); return () => window.removeEventListener("scroll", fn); }, []);
  if (!show) return null;
  return <button id="backToTop" className="show" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>↑</button>;
}

// ── PATTERN BG ──
function PatternBg() {
  return (
    <div className="pattern-bg">
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <defs>
          <pattern id="geo" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <polygon points="40,4 76,40 40,76 4,40" fill="none" stroke="#c9a84c" strokeWidth="0.6" />
            <polygon points="40,18 62,40 40,62 18,40" fill="none" stroke="#c9a84c" strokeWidth="0.4" />
            <circle cx="40" cy="40" r="1.2" fill="#c9a84c" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#geo)" />
      </svg>
    </div>
  );
}

// ── AI CHATBOT ──
function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm Aira, your MomentO event expert. ✨\n\nI can help you plan your perfect event, check pricing, or recommend the best packages! What's on your mind? 😊" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [waitingForBudget, setWaitingForBudget] = useState(false);
  const msgsRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  const QUICK_CHIPS = ["Wedding Plans 💒", "Pricing 💎", "Recommend Event 📝", "Contact Us 📞", "Book Now 📅"];

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast("Speech recognition not supported in this browser.", "processing");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error === 'not-allowed') {
        showToast("Please allow microphone access to use voice chat.", "error");
      } else {
        showToast("Voice error: " + event.error, "error");
      }
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript.trim()) {
        setInput(transcript);
        // Auto-send after a tiny delay to show the text
        setTimeout(() => {
          document.getElementById('chat-send-btn')?.click();
        }, 300);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const clearHistory = () => {
    setMessages([
      { role: "assistant", content: "Chat cleared! 🧹\n\nHow else can I help you plan your magical moments today?" }
    ]);
    setWaitingForBudget(false);
  };

  useEffect(() => {
    msgsRef.current?.scrollTo({ top: msgsRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 220);
  }, [isOpen]);
  const getSmartReply = (msg) => {
    const m = msg.toLowerCase();

    // -- AI Recommendation Logic --
    if (waitingForBudget) {
      const budget = parseInt(m.replace(/\D/g, ''));
      setWaitingForBudget(false);
      if (!budget || isNaN(budget)) return "Could you please tell me your approximate budget in numbers (e.g., 50000)? 😊";
      
      if (budget < 15000) return `With ₹${budget.toLocaleString()}, I recommend:\n\n✨ **Mini Celebration Pack**\n✦ Basic Decoration — ₹3,500\n✦ Custom Cake — ₹1,200\n✦ Photography — ₹8,000\n\nThis fits perfectly within your budget! 🎁`;
      if (budget < 50000) return `For ₹${budget.toLocaleString()}, this **Premium Party** is best:\n\n✨ **Premium Package**\n✦ Theme Decoration — ₹5,000\n✦ Gold Catering (Veg) — ₹300/plate\n✦ DJ (3 hrs) — ₹8,000\n✦ Professional Photos — ₹8,000\n\nYou get great value for money! 🌟`;
      if (budget < 150000) return `With ₹${budget.toLocaleString()}, you can have a **Grand Gala**:\n\n✨ **Elite Experience**\n✦ Royal Stage Decor — ₹25,000\n✦ Full Catering (Multi-cuisine)\n✦ Photo + Video + Drone — ₹35,000\n✦ Live Music / DJ — ₹15,000\n\nA truly memorable event awaits! 🏰`;
      return `Awesome! With ₹${budget.toLocaleString()}, you can go for our **Platinum Royal Wedding**:\n\n✨ **The Royal Indian Wedding**\n✦ Designer Mandap — ₹60,000+\n✦ Platinum Catering — ₹750/plate\n✦ Cinematic Video + Drone — ₹50,000\n✦ Horse Entry & Full Florals!\n\nWe will make it the most magical day of your life! 💍`;
    }

    if (m.match(/recommend|plan|suggest|బడ్జెట్|తక్కువ|budget/)) {
      setWaitingForBudget(true);
      return "I'd love to help you plan! 📝\n\nWhat is your approximate **Budget (₹)** for the event? (e.g. 50000 or 1 Lakh)";
    }

    if (m.match(/wedding|pelli|marriage/)) return "💒 Our Wedding package includes:\n✦ Full Catering (Customizable guests) — ₹70,000\n✦ Mandap & Stage Decoration — ₹25,000\n✦ Photography & Videography — ₹20,000\n✦ DJ Night, Mehendi, Makeup & more!\n\nWant to reserve a date? Scroll to Events section!";
    if (m.match(/birthday|పుట్టిన రోజు/)) return "🎂 Birthday packages start from ₹3,500!\n✦ Theme Decoration — ₹3,500\n✦ Custom Cake (2kg) — ₹1,800\n✦ Photography — ₹6,000\n✦ Magic Show — ₹4,000\n\nBook now from our Events section!";
    if (m.match(/price|pricing|cost|rate|package|cost|emi|₹|rupee/)) return "💎 Our Packages:\n\n✦ Basic — ₹15,000\n  Photography, Decoration, Catering (50+ Guests)\n\n✦ Premium — ₹35,000 ⭐\n  Full decoration, DJ, Photography+Video\n  EMI: ₹11,667 × 3 months\n\n✦ Royal — ₹75,000\n  Complete luxury experience!\n  EMI: ₹25,000 × 3 months\n\nCheck Pricing section for full details!";
    if (m.match(/event|events|types|which|what|kind/)) return "🎉 We plan 11+ event types:\n✦ Wedding & Engagement\n✦ Birthday & Anniversary\n✦ Corporate Events\n✦ Baby Shower & House Warming\n✦ College Fest & Music Concert\n✦ Half Saree Function\n✦ Farewell Party\n\nScroll to Events section to explore!";
    if (m.match(/book|reserve|booking|date|available|calendar/)) return "📅 To book an event:\n1. Login / Register your account\n2. Go to Events section\n3. Click Reserve on your event\n4. Choose services & date\n5. Confirm & Pay!\n\nCheck our Calendar section for available dates. Need help? Call +91 81062 96055";
    if (m.match(/haldi| పసుపు/)) return "💛 Our Haldi packages start from ₹3,500!\n✦ Traditional Decor — ₹3,500\n✦ Flower Jewelry — ₹1,200\n✦ Catering (Snacks) — ₹8,000\n\nBook now from our Events section!";
    if (m.match(/reception/)) return "🎊 Grand Reception packages start from ₹25,000!\n✦ Royal Stage Decor — ₹25,000\n✦ Catering (Grand) — ₹40,000\n✦ Video & Floral — available\n\nCheck Events section for all themes!";
    if (m.match(/contact|phone|call|whatsapp|address|location|email/)) return "📞 Contact MomentO:\n\n✆ Phone: +91 81062 96055\n✉ Email: momento.events@gmail.com\n◎ Address: 2nd Floor, MG Road\n   Rajahmundry, AP\n\nWhatsApp us for quick response! 💬";
    if (m.match(/photo|photography|video|drone|camera/)) return "📸 Photography Services:\n✦ Photography (4hrs) — ₹8,000\n✦ Photography + Video — ₹20,000\n✦ Drone Photography — ₹6,000–₹10,000\n✦ Cinematic Video — available in Royal package\n\nAll our photographers are professional & experienced!";
    if (m.match(/catering|food|meals|lunch|dinner|snacks|persons/)) return "🍽️ Catering Services:\n✦ Snacks + Meals (Base 50+ Guests)\n✦ Full Catering (Base 100+ Guests)\n✦ Grand Catering (Base 200+ Guests)\n\nEverything is customizable! How many guests are you expecting?";
    if (m.match(/decor|decoration|flower|stage|mandap|theme/)) return "🌸 Decoration Services:\n✦ Basic Decoration — ₹3,500\n✦ Theme Decoration — ₹5,000\n✦ Flower Decoration — ₹8,000–₹15,000\n✦ Mandap & Stage — ₹25,000\n✦ Romantic Setup — ₹8,000\n\nEvery decoration is customized for your dream event!";
    if (m.match(/dj|music|entertainment|band|concert/)) return "🎵 Entertainment Services:\n✦ DJ (3 hrs) — ₹8,000\n✦ DJ Night (6 hrs) — ₹18,000\n✦ Live Band (4 hrs) — ₹40,000\n✦ Sound System — ₹10,000–₹20,000\n\nPremium sound & lighting for unforgettable nights!";
    if (m.match(/hello|hi|hey|namaste|నమస్కారం|helo/)) return "Namaste! 🙏 Welcome to MomentO!\n\nI can help you with:\n✦ Event types & services\n✦ Pricing & packages\n✦ Booking & availability\n✦ Contact information\n\nWhat would you like to know? 😊";
    if (m.match(/thank|thanks|dhanyavaad|👍/)) return "Thank you for choosing MomentO! ✨\n\nWe're honored to make your moments magical. Feel free to ask anything anytime!\n\n✦ we make your moments magical ✦";
    return "Thank you for your message! 😊\n\nI can help you with:\n✦ Events — weddings, birthdays & more\n✦ Pricing — packages from ₹15,000\n✦ Booking — dates & availability\n✦ Services — catering, decor, photography\n✦ Contact — +91 81062 96055\n\nWhat would you like to know?";
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    const reply = getSmartReply(userMsg.content);
    setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    setLoading(false);
  };

  const handleChipClick = (chip) => {
    const cleaned = chip.replace(/ [^ ]+$/, ""); // Remove emoji
    setInput(cleaned);
    setTimeout(() => {
      const btn = document.getElementById('chat-send-btn');
      btn?.click();
    }, 100);
  };

  const RobotIcon = ({ size = 40 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <line x1="32" y1="3" x2="32" y2="12" stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="32" cy="2" r="3.5" fill="#ec4899" />
      <ellipse cx="32" cy="29" rx="22" ry="20" fill="#6d28d9" />
      <ellipse cx="32" cy="27" rx="22" ry="20" fill="#a855f7" />
      <ellipse cx="32" cy="26" rx="20" ry="18" fill="#d8b4fe" />
      <ellipse cx="23" cy="24" rx="6.5" ry="6" fill="#1e1b4b" />
      <ellipse cx="41" cy="24" rx="6.5" ry="6" fill="#1e1b4b" />
      <ellipse cx="21" cy="22" rx="2" ry="2" fill="white" opacity="0.85" />
      <ellipse cx="39" cy="22" rx="2" ry="2" fill="white" opacity="0.85" />
      <path d="M22 35 Q32 44 42 35" stroke="#6d28d9" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M23 36 Q32 44 41 36" stroke="#ec4899" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7" />
      <ellipse cx="15" cy="31" rx="4" ry="3" fill="#ec4899" opacity="0.4" />
      <ellipse cx="49" cy="31" rx="4" ry="3" fill="#ec4899" opacity="0.4" />
      <ellipse cx="10" cy="28" rx="4.5" ry="5.5" fill="#a855f7" />
      <ellipse cx="10" cy="27" rx="3.5" ry="4.5" fill="#d8b4fe" />
      <ellipse cx="54" cy="28" rx="4.5" ry="5.5" fill="#a855f7" />
      <ellipse cx="54" cy="27" rx="3.5" ry="4.5" fill="#d8b4fe" />
      <rect x="25" y="46" width="14" height="7" rx="4" fill="#a855f7" />
      <rect x="26" y="45" width="12" height="5" rx="3" fill="#d8b4fe" />
    </svg>
  );

  return (
    <>
      <style>{`
        @keyframes robotFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes robotPulse { 0%,100%{box-shadow:0 6px 24px rgba(168,85,247,0.45)} 50%{box-shadow:0 8px 36px rgba(168,85,247,0.75),0 2px 16px rgba(236,72,153,0.35)} }
        .robot-float { animation: robotFloat 3s ease-in-out infinite; }
        .robot-fab-btn { animation: robotPulse 2.5s ease-in-out infinite; }
        .robot-fab-btn:hover { animation:none !important; box-shadow:0 8px 36px rgba(168,85,247,0.7) !important; transform:scale(1.1); }
        .mo-chat-input { outline:none; }
        .mo-chat-input::placeholder { color:#3a3a3a; }
        .mo-chat-input:focus { border-color:rgba(168,85,247,0.65) !important; }
        .mo-close-btn:hover { color:#a855f7 !important; }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .msg-bubble { animation: fadeInUp 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        @keyframes micPulse { 0% { box-shadow: 0 0 0 0 rgba(236,72,153,0.7); } 70% { box-shadow: 0 0 0 10px rgba(236,72,153,0); } 100% { box-shadow: 0 0 0 0 rgba(236,72,153,0); } }
        .mic-active { animation: micPulse 1.5s infinite; background: #ec4899 !important; }
        .chip:hover { background: rgba(201,168,76,0.2) !important; border-color: var(--gold) !important; color: var(--gold) !important; }
      `}</style>

      {/* FAB Button */}
      <button className="robot-fab-btn" onClick={() => setIsOpen(o => !o)} style={{
        position: "fixed", bottom: 28, right: 28, width: 64, height: 64, borderRadius: "50%",
        background: "linear-gradient(145deg,#7c3aed,#a855f7)", border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 9999, transition: "transform 0.2s",
      }}>
        <div style={{ position: "absolute", top: 8, right: 8, width: 11, height: 11, borderRadius: "50%", background: "#4CAF50", border: "2px solid #7c3aed" }} />
        <div className="robot-float"><RobotIcon size={40} /></div>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: "fixed", bottom: 104, right: "min(28px, 5%)", width: "min(320px, 90%)", height: "min(495px, 70vh)",
          background: "#0d0d0d", border: "1px solid rgba(168,85,247,0.35)",
          borderRadius: 6, display: "flex", flexDirection: "column",
          overflow: "hidden", zIndex: 9998, fontFamily: "'Montserrat',sans-serif",
        }}>
          {/* Header */}
          <div style={{ padding: "14px 16px", background: "#0d0d0d", borderBottom: "1px solid rgba(168,85,247,0.25)", display: "flex", alignItems: "center", gap: 10 }}>
            <RobotIcon size={28} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: "var(--gold)", letterSpacing: 1.5 }}>
                Aira <span style={{ color: "#fff", fontSize: 10, textTransform: "uppercase", letterSpacing: 2, marginLeft: 2 }}>Assistant</span>
              </div>
              <div style={{ fontSize: 9, color: "#888", letterSpacing: 1.5, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4CAF50", display: "inline-block" }} />
                Ready to Help
              </div>
            </div>
            <button 
              onClick={clearHistory}
              title="Clear History"
              style={{ background: "none", border: "none", cursor: "pointer", color: "#555", fontSize: 13, transition: "color 0.15s", display: "flex", alignItems: "center", marginRight: 5 }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
            <button className="mo-close-btn" onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#555", fontSize: 15, transition: "color 0.15s" }}>✕</button>
          </div>
          <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(168,85,247,0.5),rgba(236,72,153,0.3),transparent)", margin: "0 16px" }} />

          {/* Messages */}
          <div ref={msgsRef} style={{ flex: 1, overflowY: "auto", padding: "14px 13px", display: "flex", flexDirection: "column", gap: 10, scrollBehavior: "smooth" }}>
            {messages.map((m, i) => (
              <div key={i} className="msg-bubble" style={{
                maxWidth: "83%", padding: "9px 13px", fontSize: 12.5, lineHeight: 1.6,
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                background: m.role === "user" ? "linear-gradient(135deg,#7c3aed,#ec4899)" : "#1a1a1a",
                color: m.role === "user" ? "#fff" : "#ddd",
                border: m.role === "user" ? "none" : "0.5px solid rgba(168,85,247,0.2)",
                borderRadius: m.role === "user" ? "10px 0 10px 10px" : "0 10px 10px 10px",
                fontWeight: m.role === "user" ? 500 : 400,
                whiteSpace: "pre-wrap",
                boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
              }}>{m.content}</div>
            ))}
            {loading && <div className="msg-bubble" style={{ fontSize: 12, color: "rgba(168,85,247,0.6)", fontStyle: "italic", paddingLeft: 10 }}>Aira is typing...</div>}
          </div>

          {/* Quick Chips Container */}
          <div style={{ display: "flex", overflowX: "auto", gap: 8, padding: "8px 13px", borderTop: "1px solid rgba(168,85,247,0.1)", whiteSpace: "nowrap", scrollbarWidth: "none" }}>
            {QUICK_CHIPS.map((chip, idx) => (
              <button 
                key={idx} 
                onClick={() => handleChipClick(chip)}
                className="chip"
                style={{
                  padding: "5px 12px", borderRadius: 15, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(168,85,247,0.2)",
                  color: "#aaa", fontSize: 10, cursor: "pointer", transition: "all 0.3s", flexShrink: 0, fontFamily: "'Montserrat',sans-serif"
                }}
              >{chip}</button>
            ))}
          </div>

          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 11, color: "rgba(168,85,247,0.35)", textAlign: "center", padding: "3px 0 5px", letterSpacing: 2 }}>
            ✦ we make your moments magical ✦
          </div>

          {/* Input */}
           <div style={{ padding: "9px 11px", borderTop: "1px solid rgba(168,85,247,0.18)", display: "flex", gap: 8, alignItems: "center", background: "#0d0d0d" }}>
            <button 
              onClick={startListening}
              className={isListening ? "mic-active" : ""}
              style={{
                width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(168,85,247,0.3)", background: "rgba(255,255,255,0.05)",
                display: "flex", alignItems: "center", justifyContent: "center", color: isListening ? "#fff" : "var(--gold)", cursor: "pointer", transition: "all 0.3s", flexShrink: 0
              }}
              title="Voice Input"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
            </button>
            <textarea
              ref={inputRef}
              className="mo-chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder={isListening ? "Listening..." : "Ask Aira something..."}
              rows={1}
              style={{ flex: 1, resize: "none", border: "0.5px solid rgba(168,85,247,0.35)", borderRadius: 8, padding: "10px 14px", fontSize: 12.5, background: "#111", color: "#ddd", maxHeight: 80, fontFamily: "'Montserrat',sans-serif", transition: "border 0.3s" }}
            />
            <button id="chat-send-btn" onClick={sendMessage} disabled={loading || !input.trim()} style={{
              width: 36, height: 36, borderRadius: "50%",
              background: loading ? "#2a2a2a" : "linear-gradient(135deg,#7c3aed,#ec4899)",
              border: "none", cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.3s"
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M22 2L15 22l-4-9-9-4 20-7z" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ── MAIN APP ──

export default function App() {
  const { 
    eventsData, setEventsData, 
    bookings, setBookings, 
    loggedInUser, setLoggedInUser,
    logout
  } = useApp();

  const [loaded, setLoaded] = useState(false);
  const [bookingEvent, setBookingEvent] = useState(null);
  const [pkgData, setPkgData] = useState(null);
  const [invoiceId, setInvoiceId] = useState(null);
  const [isInvoiceAdmin, setIsInvoiceAdmin] = useState(false);
  const [galleryEvent, setGalleryEvent] = useState(null);
  const [selectedThemeNum, setSelectedThemeNum] = useState(null);

  // Force scroll to top-left on mount to ensure layout centering
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load bookings from backend on mount
  useEffect(() => {
    fetch(`${API}/bookings`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setBookings(data.map(b => ({
            id: b.bookingId || b._id,
            name: b.name,
            phone: b.phone,
            event: b.event,
            date: b.date,
            services: b.services || "",
            price: b.price,
            advancePaid: b.advancePaid || 0,
            remainingBalance: b.remainingBalance || 0,
            status: b.status || "pending",
            payMode: b.payMode || "Full",
            userEmail: b.userEmail || "guest",
            shift: b.shift || "night",
            venue: b.venue,
            address: b.address || ""
          })));
        }
      })
      .catch(err => console.error("❌ Could not load bookings:", err));
  }, []);

  const navTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const handleReserve = (event) => {
    if (!loggedInUser) { showToast("⚠ Please login to book an event", "processing"); navTo("userAuth"); return; }
    setBookingEvent(event);
  };

  const handleBookPkg = (name, price, num, months) => {
    if (!loggedInUser) { showToast("⚠ Please login to book a package", "processing"); navTo("userAuth"); return; }
    setPkgData({ name, price, num, months });
  };

  if (!loaded) return (
    <>
      <PatternBg />
      <Loader onDone={() => setLoaded(true)} />
    </>
  );

  return (
    <>
      <PatternBg />
      <ScrollProgressBar />
      <ToastContainer />
      <BackToTop />
      <Navbar loggedInUser={loggedInUser} onLogout={logout} />
      <Hero onExplore={navTo} />
      <About />
      <Events eventsData={eventsData} onReserve={handleReserve} onViewThemes={setGalleryEvent} />
      <CalendarSection bookings={bookings} />
      <Gallery />
      <Pricing onBookPkg={handleBookPkg} />
      <EventCostCalculator />
      <UserAuth 
        loggedInUser={loggedInUser} 
        setLoggedInUser={setLoggedInUser} 
        bookings={bookings} 
        onOpenInvoice={(id) => { setInvoiceId(id); setIsInvoiceAdmin(false); }} 
      />
      <Admin 
        eventsData={eventsData} 
        setEventsData={setEventsData} 
        bookings={bookings} 
        setBookings={setBookings} 
        onOpenInvoice={(id) => { setInvoiceId(id); setIsInvoiceAdmin(true); }} 
      />
      <Reviews bookings={bookings} />
      <WhyChooseUs />
      <OurTeam />
      <Contact />

      {/* ── AI CHATBOT ── */}
      <AIChatbot />

      {galleryEvent && (
        <ThemeGalleryModal
          event={galleryEvent}
          onClose={() => setGalleryEvent(null)}
          onBookWithTheme={(num) => {
            setGalleryEvent(null);
            setSelectedThemeNum(num);
            handleReserve(galleryEvent);
          }}
        />
      )}
      {bookingEvent && (
        <BookingModal
          event={bookingEvent}
          loggedInUser={{ ...loggedInUser, preSelectedThemeNum: selectedThemeNum }}
          onClose={() => { setBookingEvent(null); setSelectedThemeNum(null); }}
          onConfirm={(b) => setBookings(p => [...p, b])}
          bookings={bookings}
        />
      )}
      {pkgData && <PkgModal pkg={pkgData} loggedInUser={loggedInUser} onClose={() => setPkgData(null)} onConfirm={(b) => setBookings(p => [...p, b])} bookings={bookings} />}
      {invoiceId && (
        <InvoiceModal 
          bookingId={invoiceId} 
          bookings={bookings} 
          isAdminView={isInvoiceAdmin} 
          onClose={() => setInvoiceId(null)} 
        />
      )}
    </>
  );
}