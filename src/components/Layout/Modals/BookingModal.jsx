import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { showToast } from "../Layout/Layout";
import { eventServices } from "../../data/constants";
import API_BASE from "../../../config/api";

const BookingModal = ({ event, onClose }) => {

  const { loggedInUser, addBooking } = useApp();
  const [name, setName] = useState(loggedInUser?.name || "");
  const [phone, setPhone] = useState(loggedInUser?.phone || "");
  const [date, setDate] = useState("");
  const [selected, setSelected] = useState([]);

  // Auto-update name when logged-in user changes
  useEffect(() => {
    if (loggedInUser?.name) {
      setName(loggedInUser.name);
    }
    if (loggedInUser?.phone) {
      setPhone(loggedInUser.phone);
    }
  }, [loggedInUser]);

  const total = selected.reduce((a, s) => a + s.price, 0);
  const services = eventServices[event?.name] || [];

  const toggle = (s) => {
    setSelected(p =>
      p.find(x => x.name === s.name)
        ? p.filter(x => x.name !== s.name)
        : [...p, s]
    );
  };

  const [showSuccess, setShowSuccess] = useState(false);
  const [confirmedId, setConfirmedId] = useState("");

  // ⭐ RAZORPAY PAYMENT FLOW
  const pay = async () => {
    if (!name || !phone || !date || !selected.length) {
      showToast("⚠ Fill all details & select services", "processing");
      return;
    }

    const bookingId = "BK" + Math.floor(100000 + Math.random() * 900000);
    const bookingData = {
      bookingId,
      event: event.name,
      date,
      name,
      phone,
      services: selected.map(s => s.name).join(", "),
      price: total,
      user: loggedInUser?._id || loggedInUser?.id || "unknown"
    };

    try {
      showToast("💳 Initializing Secure Payment...", "processing");

      // 1. Create Order and Pending Booking on Backend
      const orderRes = await fetch(`${API_BASE}/payment/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: total,
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
        description: `Booking for ${event.name}`,
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
                bookingId,
                bookingData // Fallback if record missing
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
              
              // Standard confetti trigger (simple version)
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
          <h2 className="ps-title">Booking Confirmed!</h2>
          <p className="ps-subtitle">Your celebration is now secured</p>
          
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
    <div className="modal-overlay open">
      <div className="modal-box" onClick={e => e.stopPropagation()}>

        <div className="sheet-handle" />

        <div className="modal-header">
          <div className="modal-eyebrow">✦ Reservation</div>
          <div className="modal-title">Book {event?.name}</div>
        </div>

        <div className="modal-body">

          <input
            className="modal-input"
            type="text"
            placeholder="Your Full Name"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <input
            className="modal-input"
            type="tel"
            placeholder="Your Phone Number"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />

          <input
            className="modal-input"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />

          <div className="services-title">Select Services</div>

          {services.map((s, i) => {

            const sel = selected.find(x => x.name === s.name);

            return (
              <div
                key={i}
                className="service-item"
                onClick={() => toggle(s)}
              >

                <div className={`service-cb${sel ? " checked" : ""}`}>
                  {sel ? "✓" : ""}
                </div>

                <label>{s.name}</label>

                <span className="price-tag">
                  ₹{s.price.toLocaleString("en-IN")}
                </span>

              </div>
            );

          })}

          <div className="total-bar">
            <div className="total-label">Total Amount</div>
            <div className="total-amount">
              ₹{total.toLocaleString("en-IN")}
            </div>
          </div>

        </div>

        <div className="modal-footer">
          <button className="btn-pay" onClick={pay}>
            Confirm & Pay
          </button>

          <button className="btn-close" onClick={onClose}>
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};

export default BookingModal;