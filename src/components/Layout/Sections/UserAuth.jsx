import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import API_BASE from "../../../config/api";
import { showToast } from "../Layout/Layout";

const UserAuth = ({ onOpenInvoice }) => {
  const { loggedInUser, setLoggedInUser, logout: globalLogout, bookings, setBookings } = useApp();
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ name:"", email:"", phone:"", password:"" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const myBookings = bookings.filter(b => b.name === loggedInUser?.name);

  // Load bookings from backend with retry logic
  const loadBookings = async () => {
    try {
      console.log("🔄 Loading bookings from backend...");
      const res = await fetch(`${API_BASE}/bookings`);
      if (!res.ok) throw new Error("Failed to load bookings");
      const allBookings = await res.json();
      setBookings(allBookings);
    } catch (err) {
      console.error("❌ Failed to load bookings:", err);
    }
  };

  const login = async () => {
    if (!form.email || !form.password) { setError("✗ Email and password required"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("momento_user", JSON.stringify(data));
      setLoggedInUser(data);
      showToast(`✓ Welcome back, ${data.name}!`, "success");
    } catch (err) {
      setError(`✗ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const register = async () => {
    if (!form.name || !form.email || !form.phone || !form.password) { setError("✗ Fill all fields"); return; }
    if (form.password.length < 6) { setError("✗ Password min 6 chars"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      localStorage.setItem("momento_user", JSON.stringify(data));
      setLoggedInUser(data);
      showToast(`🎉 Welcome, ${data.name}!`, "confirmed");
    } catch (err) {
      setError(`✗ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    globalLogout();
    setForm({ name:"", email:"", phone:"", password:"" });
    setTab("login");
    showToast("✓ Logged out", "");
  };

  const badge = (status) => {
    const c = { pending:"#f0a500", confirmed:"#c9a84c", completed:"#4caf82", cancelled:"#e05a5a" };
    return <span style={{ background:"rgba(201,168,76,.12)", border:`1px solid ${c[status]||"#c9a84c"}`, color:c[status]||"#c9a84c", fontSize:10, padding:"3px 10px", borderRadius:20 }}>{status}</span>;
  };

  return (
    <section id="userAuth" className="userauth-section">
      <div className="section-wrap">
        <div className="section-label">My Account</div>
        <h2 className="section-title">User <em>{loggedInUser ? "Dashboard" : "Login"}</em></h2>

        {loggedInUser ? (
          <div>
            <div className="user-welcome">
              <div className="user-avatar">{loggedInUser.name[0].toUpperCase()}</div>
              <div className="user-welcome-text">
                <h3>Welcome, {loggedInUser.name}!</h3>
                <p>{loggedInUser.email}</p>
              </div>
              <button className="btn-close" style={{ marginLeft:"auto" }} onClick={logout}>Logout</button>
            </div>
            <div className="user-bookings-table">
              <div className="user-bookings-head">
                <h4>◈ My Bookings</h4>
                <span style={{ fontSize:11, color:"var(--text-muted)" }}>{myBookings.length} bookings</span>
                <button 
                  style={{ marginLeft: "10px", fontSize: "10px", padding: "2px 8px" }}
                  onClick={loadBookings}
                >
                  🔄 Refresh
                </button>
              </div>
              <div className="booking-card-list">
                {myBookings.length === 0 ? (
                  <div className="no-bookings">No bookings yet.</div>
                ) : myBookings.map((b, i) => (
                  <div key={i} className="booking-card">
                    <div className="bc-top"><span className="bc-id">{b.id?.slice(0, 8) || 'ID'}</span>{badge(b.status || 'confirmed')}</div>
                    <div className="bc-event">{b.event}</div>
                    <div className="bc-date">📅 {b.date}</div>
                    <div className="bc-phone">📞 {b.phone}</div>
                    <div className="bc-services">🎯 {b.services}</div>
                    <div className="bc-price">₹{typeof b.price === "number" ? b.price.toLocaleString("en-IN") : b.price}</div>
                    <div className="bc-actions">
                      <button className="btn-invoice" onClick={() => onOpenInvoice(b.id)}>📄 Invoice</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ maxWidth:420 }}>
            <div className="auth-tabs">
              {["login","register","forgot"].map(t => (
                <button key={t} className={`auth-tab${tab === t ? " active" : ""}`} onClick={() => { setTab(t); setError(""); }}>
                  {t === "login" ? "Login" : t === "register" ? "Register" : "Forgot"}
                </button>
              ))}
            </div>
            <div className="auth-box">
              {tab === "login" && <>
                <h3>◈ Welcome Back</h3>
                <div className="auth-form-group"><label>Email</label><input type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm({ ...form, email:e.target.value })} /></div>
                <div className="auth-form-group"><label>Password</label><input type="password" placeholder="Enter password" value={form.password} onChange={e => setForm({ ...form, password:e.target.value })} /></div>
                {error && <div className="auth-error show">{error}</div>}
                <button className={`btn-primary ${loading ? 'loading' : ''}`} style={{ width:"100%" }} onClick={login} disabled={loading}>
                  {loading ? "Processing..." : "Login to My Account"}
                </button>
                <div style={{ textAlign:"center", marginTop:14, fontSize:12, color:"var(--text-muted)" }}>No account? <span style={{ color:"var(--gold)", cursor:"pointer" }} onClick={() => setTab("register")}>Register here</span></div>
              </>}
              {tab === "register" && <>
                <h3>◈ Create Account</h3>
                <div className="auth-form-group"><label>Full Name</label><input type="text" placeholder="Your full name" value={form.name} onChange={e => setForm({ ...form, name:e.target.value })} /></div>
                <div className="auth-form-group"><label>Email</label><input type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm({ ...form, email:e.target.value })} /></div>
                <div className="auth-form-group"><label>Phone</label><input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm({ ...form, phone:e.target.value })} /></div>
                <div className="auth-form-group"><label>Password</label><input type="password" placeholder="Min 6 characters" value={form.password} onChange={e => setForm({ ...form, password:e.target.value })} /></div>
                {error && <div className="auth-error show">{error}</div>}
                <button className={`btn-primary ${loading ? 'loading' : ''}`} style={{ width:"100%" }} onClick={register} disabled={loading}>
                  {loading ? "Processing..." : "Create Account"}
                </button>
              </>}
              {tab === "forgot" && <>
                <h3>◈ Reset Password</h3>
                <div className="auth-form-group"><label>Registered Email</label><input type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm({ ...form, email:e.target.value })} /></div>
                <button className="btn-primary" style={{ width:"100%" }} onClick={() => showToast("✅ Reset link sent (demo mode)", "success")}>Send Reset Link</button>
              </>}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default UserAuth;