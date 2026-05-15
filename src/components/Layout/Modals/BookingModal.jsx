import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "../../../context/AppContext";
import { showToast } from "../Layout";
import { eventServices, eventsDataDefault } from "../../../data/constants";
import API_BASE from "../../../config/api";

const BookingModal = ({ event, onClose, preSelectedThemeNum }) => {

  const { loggedInUser, addBooking } = useApp();
  const [name, setName] = useState(loggedInUser?.name || "");
  const [phone, setPhone] = useState(loggedInUser?.phone || "");
  const [date, setDate] = useState("");
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedThemeNum, setSelectedThemeNum] = useState(preSelectedThemeNum || null);

  // Auto-update name/phone when logged-in user changes
  useEffect(() => {
    if (loggedInUser?.name) setName(loggedInUser.name);
    if (loggedInUser?.phone) setPhone(loggedInUser.phone);
  }, [loggedInUser]);

  // Find themes for this event
  const eventData = useMemo(() => 
    eventsDataDefault.find(e => e.name === event?.name), [event]
  );
  
  const themes = eventData?.themes || [];
  const selectedTheme = themes.find(t => t.num === selectedThemeNum);
  const services = eventServices[event?.name] || [];

  // Calculate Total
  const total = useMemo(() => {
    const servicesTotal = selectedServices.reduce((a, s) => a + s.price, 0);
    const themePrice = selectedTheme?.price || 0;
    return servicesTotal + themePrice;
  }, [selectedServices, selectedTheme]);

  const toggleService = (s) => {
    setSelectedServices(p =>
      p.find(x => x.name === s.name)
        ? p.filter(x => x.name !== s.name)
        : [...p, s]
    );
  };

  const [showSuccess, setShowSuccess] = useState(false);
  const [confirmedId, setConfirmedId] = useState("");

  const pay = async () => {
    if (!name || !phone || !date) {
      showToast("⚠ Fill all details (Name, Phone, Date)", "processing");
      return;
    }
    if (!selectedThemeNum && !selectedServices.length) {
       showToast("⚠ Select at least one theme or service", "processing");
       return;
    }

    const bookingId = "BK" + Math.floor(100000 + Math.random() * 900000);
    const bookingData = {
      bookingId,
      event: event.name,
      date,
      name,
      phone,
      services: selectedServices.map(s => s.name).join(", "),
      price: total,
      user: loggedInUser?._id || loggedInUser?.id || "unknown",
      ...(selectedThemeNum ? { themeNum: selectedThemeNum } : {})
    };

    try {
      showToast("💳 Initializing Secure Payment...", "processing");

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

            const verifyRes = await fetch(`${API_BASE}/payment/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                bookingId,
                bookingData
              })
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              addBooking({ 
                ...bookingData, 
                _id: verifyData.booking._id, 
                status: "confirmed",
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id
              });
              setConfirmedId(bookingId);
              setShowSuccess(true);
              
              // Trigger Confetti
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
        theme: { color: "#0a0a0f" }
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
              <path d="M14.1 27.2l7.1 34.2 16.7-16.8" />
            </svg>
          </div>
          <h2 className="ps-title">Booking Confirmed!</h2>
          <p className="ps-subtitle">Your celebration is now secured</p>
          <div className="ps-id-box">
            <div className="ps-id-label">Registration ID</div>
            <div className="ps-id-val">{confirmedId}</div>
          </div>
          <button className="ps-btn" onClick={onClose}>Go to Dashboard</button>
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

        <div className="modal-body custom-scrollbar">
          
          <div className="modal-section-label">Personal Details</div>
          <div className="modal-input-row">
            <input className="modal-input" type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
            <input className="modal-input" type="tel" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <input className="modal-input" type="date" value={date} onChange={e => setDate(e.target.value)} />

          {/* Theme Selection */}
          <div className="modal-section-label" style={{ marginTop: 20 }}>Decoration Theme</div>
          {!preSelectedThemeNum ? (
            <div className="theme-selection-grid">
              {themes.map(t => (
                <div 
                  key={t.num} 
                  className={`theme-thumb-card ${selectedThemeNum === t.num ? 'active' : ''}`}
                  onClick={() => setSelectedThemeNum(t.num)}
                >
                  <img src={t.img} alt={`Theme ${t.num}`} />
                  <div className="theme-thumb-overlay">
                    <span>#{t.num}</span>
                    <b>₹{t.price}</b>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="selected-theme-badge">
              <span className="badge-icon">🎨</span>
              <div className="badge-info">
                <label>Confirmed Decoration</label>
                <div className="badge-val">Theme #{preSelectedThemeNum} <span className="badge-price">(₹{selectedTheme?.price || 0})</span></div>
              </div>
              <div className="badge-check">✓</div>
            </div>
          )}

          {/* Services Section */}
          <div className="modal-section-label" style={{ marginTop: 20 }}>Additional Services</div>
          <div className="services-grid-compact">
            {services.map((s, i) => {
              const isSel = selectedServices.find(x => x.name === s.name);
              return (
                <div key={i} className={`service-pill ${isSel ? 'active' : ''}`} onClick={() => toggleService(s)}>
                  <span className="service-name">{s.name}</span>
                  <span className="service-price">₹{s.price}</span>
                  {isSel && <span className="service-check">✓</span>}
                </div>
              );
            })}
          </div>

          <div className="total-bar-premium">
            <div className="total-info">
              <span className="total-tag">Total Amount</span>
              <span className="total-val">₹{total.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-pay-premium" onClick={pay}>Confirm & Pay Securely</button>
          <button className="btn-close-simple" onClick={onClose}>Cancel</button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .modal-section-label { font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--gold); opacity: 0.7; margin-bottom: 10px; font-weight: 600; }
        .modal-input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        
        .theme-selection-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 8px; margin-bottom: 15px; }
        .theme-thumb-card { position: relative; border-radius: 8px; overflow: hidden; cursor: pointer; border: 2px solid transparent; transition: 0.3s; height: 100px; }
        .theme-thumb-card.active { border-color: var(--gold); transform: scale(0.95); }
        .theme-thumb-card img { width: 100%; height: 100%; object-fit: cover; }
        .theme-thumb-overlay { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.8)); padding: 5px; color: #fff; font-size: 10px; display: flex; justify-content: space-between; align-items: flex-end; }
        
        .selected-theme-badge { display: flex; align-items: center; gap: 12px; background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.3); padding: 12px; border-radius: 12px; }
        .badge-icon { font-size: 20px; }
        .badge-info label { display: block; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: var(--gold); }
        .badge-val { font-family: 'Cormorant Garamond', serif; font-size: 16px; color: #fff; }
        .badge-price { font-size: 12px; opacity: 0.6; margin-left: 5px; }
        .badge-check { margin-left: auto; color: var(--gold); font-weight: bold; }

        .services-grid-compact { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
        .service-pill { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 8px 12px; border-radius: 20px; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.3s; }
        .service-pill.active { background: rgba(201,168,76,0.15); border-color: var(--gold); }
        .service-name { font-size: 12px; color: #fff; }
        .service-price { font-size: 11px; color: var(--gold); opacity: 0.8; }
        .service-check { font-size: 10px; color: var(--gold); }

        .total-bar-premium { background: linear-gradient(90deg, transparent, rgba(201,168,76,0.1), transparent); padding: 15px; border-radius: 12px; margin-top: 10px; border: 1px solid rgba(201,168,76,0.1); }
        .total-info { display: flex; justify-content: space-between; align-items: center; }
        .total-tag { font-size: 13px; color: #fff; opacity: 0.7; }
        .total-val { font-size: 22px; color: var(--gold); font-family: 'Cormorant Garamond', serif; font-weight: bold; }

        .btn-pay-premium { width: 100%; background: var(--gold); color: #000; border: none; padding: 14px; border-radius: 12px; font-weight: 700; font-size: 15px; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 15px rgba(201,168,76,0.3); }
        .btn-pay-premium:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(201,168,76,0.4); }
        .btn-close-simple { width: 100%; background: transparent; color: #fff; opacity: 0.5; border: none; padding: 10px; margin-top: 5px; cursor: pointer; }
      `}} />
    </div>
  );
};

export default BookingModal;