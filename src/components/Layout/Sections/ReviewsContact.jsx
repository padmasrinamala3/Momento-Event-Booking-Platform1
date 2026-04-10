import React, { useState } from "react";
import { showToast } from "../Layout/Layout";
import { WHATSAPP } from "../../data/constants";
import API_BASE from "../../../config/api";

// ── REVIEWS ──
export const Reviews = () => {
  const [stars, setStars] = useState(0), [hov, setHov] = useState(0);
  const [name, setName] = useState(""), [text, setText] = useState("");
  const [reviews, setReviews] = useState([]);
  const defaults = [
    { name:"Rahul", text:"MomentO made our wedding unforgettable!", stars:5 },
    { name:"Priya", text:"Best event planning service. Everything was perfect.", stars:5 },
    { name:"Arjun", text:"Decoration and catering were amazing.", stars:5 },
  ];
  return (
    <section id="rating" className="reviews-section">
      <div className="section-wrap">
        <div className="section-label">Testimonials</div>
        <h2 className="section-title">What Our <em>Clients Say</em></h2>
        <div className="reviews-grid">
          {[...defaults, ...reviews].map((r, i) => (
            <div key={i} className="review-card">
              <p>"{r.text}"</p>
              <h4>{"★".repeat(r.stars)}</h4>
              <span>— {r.name}</span>
            </div>
          ))}
        </div>
        <div className="rating-form-wrap">
          <h3>✦ Share Your Experience</h3>
          <div className="star-picker">
            {[1,2,3,4,5].map(v => (
              <span key={v} className={(hov || stars) >= v ? "lit" : ""}
                onMouseEnter={() => setHov(v)} onMouseLeave={() => setHov(0)}
                onClick={() => setStars(v)}>★</span>
            ))}
          </div>
          <input className="rating-input" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} />
          <textarea className="rating-input" placeholder="Write your review..." value={text} onChange={e => setText(e.target.value)} />
          <button className="btn-primary" style={{ width:"100%" }} onClick={async () => {
            if (!name || !text || !stars) { showToast("✗ Fill name, review & select stars", "processing"); return; }
            
            try {
              const res = await fetch(`${API_BASE}/reviews`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, text, stars })
              });
              
              if (res.ok) {
                setReviews(p => [...p, { name, text, stars }]);
                setName(""); setText(""); setStars(0);
                showToast("🎉 Thank you, " + name + "!", "confirmed");
              } else {
                showToast("❌ Failed to submit review", "error");
              }
            } catch (err) {
              console.error("Review submission error:", err);
              showToast("❌ Network error", "error");
            }
          }}>Submit Review</button>
        </div>
      </div>
    </section>
  );
};

// ── CONTACT ──
export const Contact = () => (
  <section id="contact">
    <div className="section-wrap">
      <div className="section-label">Reach Us</div>
      <h2 className="section-title">Get in <em>Touch</em></h2>
      <div className="contact-grid">
        <div className="contact-card"><div className="contact-icon">✆</div><div className="contact-type">Phone</div><div className="contact-val"><a href="tel:+918106296055" style={{ color:"inherit", textDecoration:"none" }}>+91 81062 96055</a></div></div>
        <div className="contact-card"><div className="contact-icon">✉</div><div className="contact-type">Email</div><div className="contact-val"><a href="mailto:momento.events@gmail.com" style={{ color:"inherit", textDecoration:"none" }}>momento.events@gmail.com</a></div></div>
        <div className="contact-card"><div className="contact-icon">◎</div><div className="contact-type">Address</div><div className="contact-val">2nd Floor, MG Road<br />Rajahmundry, AP</div></div>
      </div>
      <div style={{ textAlign:"center", marginTop:44 }}>
        <div style={{ fontSize:10, letterSpacing:3, textTransform:"uppercase", color:"var(--gold)", marginBottom:18 }}>✦ Quick Enquiry</div>
        <a href={`https://wa.me/${WHATSAPP}?text=Hello%20MomentO!`} target="_blank" rel="noreferrer" className="whatsapp-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Chat on WhatsApp
        </a>
      </div>
    </div>
    <footer><div className="f-logo">MomentO</div><div>© 2025 MomentO Premium Events · Rajahmundry, AP</div></footer>
  </section>
);