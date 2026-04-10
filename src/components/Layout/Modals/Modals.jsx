import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { showToast } from "../Layout/Layout";

// ── PACKAGE MODAL ──
export const PackageModal = ({ pkg, onClose }) => {
  const { loggedInUser, addBooking } = useApp();
  const [name, setName] = useState(loggedInUser?.name || "");
  const [phone, setPhone] = useState(loggedInUser?.phone || "");
  const [date, setDate] = useState("");
  const [payMode, setPayMode] = useState("full");
  const emi = Math.ceil((pkg?.num || 0) / 3);

  const confirm = () => {
    if (!name || !phone || !date) { showToast("✗ Fill all details", "processing"); return; }
    const b = {
      id: "BK" + Date.now().toString().slice(-6),
      name, phone, event: pkg.name + " Package", date,
      services: "Package · " + (payMode === "emi" ? "EMI 3 Months" : "Full Payment"),
      price: pkg.num, status: "confirmed",
      payMode: payMode === "emi" ? "EMI" : "Full",
      userEmail: loggedInUser?.email || "guest"
    };
    showToast("⏳ Processing...", "processing", 2200);
    setTimeout(() => {
      showToast("✅ Payment Successful!", "success", 3000);
      setTimeout(() => {
        addBooking(b); onClose();
        showToast("🎉 " + pkg.name + " Package Booked — " + name, "confirmed", 3500);
      }, 800);
    }, 2000);
  };

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="pkg-modal-top">
          <div style={{ fontSize:10, letterSpacing:4, textTransform:"uppercase", color:"var(--gold)", marginBottom:8 }}>✦ Package Booking</div>
          <div className="pkg-name">{pkg?.name}</div>
          <div className="pkg-price">{pkg?.price}</div>
        </div>
        <div className="pkg-modal-body">
          <div className="pkg-emi">💳 EMI: <strong>₹{emi.toLocaleString("en-IN")}</strong>/month × 3 — No extra charge!</div>
          <input className="pkg-input" type="text" placeholder="Your Full Name" value={name} onChange={e => setName(e.target.value)} />
          <input className="pkg-input" type="tel" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} />
          <input className="pkg-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
          <div style={{ fontSize:10, letterSpacing:2, textTransform:"uppercase", color:"var(--gold)", marginBottom:10 }}>Payment Option</div>
          <div className="pkg-emi-toggle">
            <button className={`emi-opt${payMode === "full" ? " active" : ""}`} onClick={() => setPayMode("full")}>Full Payment</button>
            <button className={`emi-opt${payMode === "emi" ? " active" : ""}`} onClick={() => setPayMode("emi")}>EMI — 3 Months</button>
          </div>
        </div>
        <div className="pkg-modal-footer">
          <button className="btn-book-pkg" onClick={confirm}>Confirm Booking</button>
          <button className="btn-close" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

// ── INVOICE MODAL ──
export const InvoiceModal = ({ bookingId, onClose }) => {
  const { bookings } = useApp();
  const b = bookings.find(x => x.id === bookingId);
  if (!b) return null;

  return (
    <div className="invoice-modal-overlay open" onClick={onClose}>
      <div className="invoice-box" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" style={{ background:"rgba(0,0,0,.15)" }} />
        <div className="invoice-header">
          <div className="invoice-logo">MomentO</div>
          <div className="invoice-sub">Premium Event Planning · Official Receipt</div>
        </div>
        <div className="invoice-body">
          <div className="invoice-meta">
            <div className="invoice-meta-block"><h5>Billed To</h5><p>{b.name}</p><p style={{ color:"#888", fontSize:11, marginTop:2 }}>{b.phone || ""}</p></div>
            <div className="invoice-meta-block" style={{ textAlign:"right" }}><h5>Invoice No.</h5><p className="invoice-id">#{b.id}</p><p style={{ fontSize:11, color:"#888", marginTop:2 }}>Event Date: {b.date}</p></div>
          </div>
          <table className="invoice-items">
            <thead><tr><th>Description</th><th>Details</th><th style={{ textAlign:"right" }}>Amount</th></tr></thead>
            <tbody>
              <tr><td>{b.event}</td><td>{b.date}</td><td>—</td></tr>
              {b.services.split(", ").map((s, i) => <tr key={i}><td colSpan={2} style={{ color:"#888", fontSize:11 }}>{s}</td><td>Included</td></tr>)}
              <tr><td colSpan={2} style={{ color:"#aaa", fontSize:10 }}>Payment Mode</td><td>{b.payMode || "Full"}</td></tr>
            </tbody>
          </table>
          <div className="invoice-total-row">
            <div className="it-label">Total Amount</div>
            <div className="it-amount">₹{typeof b.price === "number" ? b.price.toLocaleString("en-IN") : b.price}</div>
          </div>
          <div style={{ textAlign:"center", marginBottom:16 }}>
            <span className="status-badge confirmed">✦ {b.status}</span>
          </div>
          <div className="invoice-footer-note">Thank you for choosing MomentO Premium Events · Rajahmundry, AP<br />📞 +91 81062 96055 · ✉ momento.events@gmail.com</div>
        </div>
        <div className="invoice-actions">
          <button className="btn-download-invoice" onClick={() => window.print()}>⬇ Download / Print</button>
          <button className="btn-close-invoice" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};