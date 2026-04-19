import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { showToast } from "../Layout/Layout";
import API_BASE from "../../../config/api";

// ── PACKAGE MODAL ──
export const PackageModal = ({ pkg, onClose }) => {
  const { loggedInUser, addBooking } = useApp();
  const [name, setName] = useState(loggedInUser?.name || "");
  const [phone, setPhone] = useState(loggedInUser?.phone || "");
  const [date, setDate] = useState("");
  const [payMode, setPayMode] = useState("full");
  const [showSuccess, setShowSuccess] = useState(false);
  const [confirmedId, setConfirmedId] = useState("");
  const emi = Math.ceil((pkg?.num || 0) / 3);

  const confirm = async () => {
    if (!name || !phone || !date) { showToast("✗ Fill all details", "processing"); return; }
    
    const bookingId = "BK" + Math.floor(100000 + Math.random() * 900000);
    const bookingData = {
      bookingId,
      event: pkg.name + " Package",
      date,
      name,
      phone,
      services: "Package · " + (payMode === "emi" ? "EMI 3 Months" : "Full Payment"),
      price: pkg.num,
      payMode: payMode === "emi" ? "EMI" : "Full",
      user: loggedInUser?._id || loggedInUser?.id || "unknown"
    };

    try {
      showToast("💳 Initializing Secure Payment...", "processing");

      // 1. Create Order and Pending Booking on Backend
      const orderRes = await fetch(`${API_BASE}/payment/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: pkg.num,
          bookingData: {
            ...bookingData,
            userEmail: loggedInUser?.email || "guest"
          }
        })
      });
      const orderData = await orderRes.json();

      if (!orderData.id) throw new Error("Order creation failed");

      // 2. Fetch Razorpay Key and Launch Checkout
      const keyRes = await fetch(`${API_BASE}/payment/get-key`);
      const { key } = await keyRes.json();

      const options = {
        key: key, 
        amount: orderData.amount,
        currency: orderData.currency,
        name: "MomentO Events",
        description: `Package: ${pkg.name}`,
        order_id: orderData.id,
        handler: async (response) => {
          try {
            showToast("🔒 Verifying Payment...", "processing");

            // 3. Verify Payment on Backend
            const verifyRes = await fetch(`${API_BASE}/payment/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                bookingId
              })
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              // 4. Update local state and show success
              addBooking({ 
                ...bookingData, 
                _id: verifyData.booking._id, 
                status: "confirmed",
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id
              });
              setConfirmedId(bookingId);
              setShowSuccess(true);
              
              // Standard confetti trigger
              for(let i=0; i<30; i++) {
                const conf = document.createElement("div");
                conf.className = "confetti-piece";
                conf.style.left = Math.random() * 100 + "vw";
                conf.style.backgroundColor = ["#C9A84C", "#fff", "#ec4899"][Math.floor(Math.random()*3)];
                conf.style.transform = `rotate(${Math.random() * 360}deg)`;
                conf.style.animationDuration = (Math.random() * 3 + 2) + "s";
                document.body.appendChild(conf);
                setTimeout(() => conf.remove(), 5000);
              }
            } else {
              showToast("❌ Payment verification failed", "error");
            }
          } catch (err) {
            console.error(err);
            showToast("❌ Verification Error", "error");
          }
        },
        prefill: { name, contact: phone, email: loggedInUser?.email || "" },
        theme: { color: "#0a0a0f" },
        config: {
          display: {
            blocks: {
              upi: {
                name: "Pay via UPI ID",
                instruments: [{ method: "upi", flows: ["collect"] }]
              }
            },
            sequence: ["block.upi"],
            preferences: { show_default_blocks: false }
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        showToast("❌ Payment Failed: " + response.error.description, "error");
      });
      rzp.open();

    } catch (err) {
      console.error(err);
      showToast("❌ Could not start payment", "error");
    }
  };

  if (showSuccess) {
    return (
      <div className="payment-success-overlay">
        <div className="ps-content">
          <div className="ps-icon-wrap">
            <svg className="ps-checkmark" viewBox="0 0 52 52">
              <path d="M14.1 27.2l7.1 7.2 16.7-16.8" />
            </svg>
          </div>
          <h2 className="ps-title">Package Booked!</h2>
          <p className="ps-subtitle">Your {pkg?.name} package is now active</p>
          
          <div className="ps-id-box">
            <div className="ps-id-label">Registration ID</div>
            <div className="ps-id-val">{confirmedId}</div>
          </div>
          
          <button className="ps-btn" onClick={onClose}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

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