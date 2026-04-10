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

  // ⭐ PAYMENT FUNCTION
  const pay = async () => {
    console.log("=== PAY CLICKED ===");
    console.log("name:", name);
    console.log("date:", date);
    console.log("selected:", selected);
    console.log("loggedInUser:", loggedInUser);

    if (!name || !phone || !date || !selected.length) {
      console.log("❌ VALIDATION FAILED — name/phone/date/services missing");
      showToast("⚠ Fill all details & select services", "processing");
      return;
    }

    console.log("✅ Validation Passed — going to API");

    const b = {
      bookingId: "BK" + Math.floor(100000 + Math.random() * 900000), // Generate custom booking ID
      event: event.name,
      date: date,
      name: name,
      phone: phone,
      services: selected.map(s => s.name).join(", "),
      price: total,
      user: loggedInUser?._id || loggedInUser?.id || "unknown"
    };

    console.log("📦 Booking Object:", b);
    showToast("💳 Processing Payment...", "processing", 2200);

    // Try to sync with backend first
    try {
      console.log("🚀 Sending to backend...");
      console.log("📦 Booking data:", b);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const res = await fetch(`${API_BASE}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(b),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log("📡 Response status:", res.status);
      console.log("📡 Response ok:", res.ok);

      if (!res.ok) {
        const errorData = await res.json();
        console.error("❌ Backend Error Response:", errorData);
        throw new Error(errorData.message || "Server error");
      }

      const data = await res.json();
      console.log("✅ Saved in MongoDB:", data);

      // Update booking object with real MongoDB ID
      b._id = data._id;
      b.id = data._id;

      // Add to local state
      addBooking(b);
      console.log("✅ Booking added to local state with MongoDB ID:", data._id);

      // Success feedback
      showToast(
        "✅ Payment ₹" + total.toLocaleString("en-IN") + " Successful!",
        "success",
        3000
      );

      setTimeout(() => {
        onClose();

        showToast(
          "🎉 Booking Confirmed!\n" + 
          "Name: " + name + "\n" +
          "Event: " + event.name + "\n" +
          "Date: " + date + "\n" +
          "Amount: ₹" + total.toLocaleString("en-IN") + "\n" +
          "ID: " + b.id?.slice(0, 8) + "...",
          "confirmed",
          5000
        );

      }, 800);

    } catch (err) {
      console.error("❌ Backend Error:", err);
      
      // Fallback: add to local state with temp ID
      const tempId = "temp_" + Date.now();
      b._id = tempId;
      b.id = tempId;
      
      addBooking(b);
      console.log("🔄 Backend failed, but booking saved locally with temp ID:", tempId);
      showToast("⚠️ Booking saved locally. Server sync may be delayed.", "warning", 4000);
      
      setTimeout(() => {
        onClose();

        showToast(
          "🎉 Booking Confirmed!\n" + 
          "Name: " + name + "\n" +
          "Event: " + event.name + "\n" +
          "Date: " + date + "\n" +
          "Amount: ₹" + total.toLocaleString("en-IN") + "\n" +
          "ID: " + b.id?.slice(0, 8) + "...",
          "confirmed",
          5000
        );

      }, 800);
      
      return;
    }
  };

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