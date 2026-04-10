import React from "react";
import { useApp } from "../../context/AppContext";
import { showToast } from "../Layout/Layout";

const PLANS = [
  { 
    name: "Basic", 
    price: "₹15,000", 
    num: 15000, 
    sub: "Perfect for small gatherings", 
    emi: "₹5,000", 
    features: [
      { text: "Basic Decoration", icon: <SparkleIcon /> },
      { text: "Photography (4 hrs)", icon: <CameraIcon /> },
      { text: "Catering (50 persons)", icon: <CateringIcon /> },
      { text: "Event Coordinator", icon: <UserIcon /> }
    ] 
  },
  { 
    name: "Premium", 
    price: "₹35,000", 
    num: 35000, 
    sub: "Best value for celebrations", 
    emi: "₹11,667", 
    popular: true, 
    features: [
      { text: "Flower & Stage Decoration", icon: <SparkleIcon /> },
      { text: "Photography + Video", icon: <CameraIcon /> },
      { text: "Catering (100 persons)", icon: <CateringIcon /> },
      { text: "DJ / Music (3 hrs)", icon: <MusicIcon /> },
      { text: "Dedicated Coordinator", icon: <UserIcon /> }
    ] 
  },
  { 
    name: "Royal", 
    price: "₹75,000", 
    num: 75000, 
    sub: "Ultimate luxury experience", 
    emi: "₹25,000", 
    features: [
      { text: "Full Stage & Floral Decoration", icon: <SparkleIcon /> },
      { text: "Photography + Drone Video", icon: <CameraIcon /> },
      { text: "Catering (200 persons)", icon: <CateringIcon /> },
      { text: "DJ Night (6 hrs)", icon: <MusicIcon /> },
      { text: "Mehendi + Makeup Artist", icon: <PaletteIcon /> },
      { text: "VIP Coordinator", icon: <UserIcon /> }
    ] 
  },
];

// SVG Icons
function SparkleIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feature-icon"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg> }
function CameraIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feature-icon"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg> }
function CateringIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feature-icon"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg> }
function UserIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feature-icon"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg> }
function MusicIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feature-icon"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg> }
function PaletteIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feature-icon"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.7-.39 2.3-1.03a4.05 4.05 0 0 0 .9-2.97c-.08-1 .6-1.87 1.6-2 .93-.13 1.25.7 1.25.7S22 17.5 22 12c0-5.5-4.5-10-10-10Z"/></svg> }

const Pricing = ({ onBookPkg }) => {
  const { loggedInUser } = useApp();

  const handleBook = (p) => {
    if (!loggedInUser) {
      showToast("⚠ Please login to book a package", "processing");
      document.getElementById("userAuth")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    onBookPkg(p.name, p.price, p.num, 3);
  };

  return (
    <section id="pricing" className="pricing-section">
      <div className="section-wrap">
        <div className="section-label">Investment Packages</div>
        <h2 className="section-title">The Art of <em>Celebration</em></h2>
        <div className="pricing-grid">
          {PLANS.map((p, i) => (
            <div key={i} className={`price-card shadow-premium ${p.popular ? " popular" : ""}`}>
              {p.popular && <div className="popular-badge">⭐ Recommended</div>}
              <h3>{p.name}</h3>
              <div className="price-tag-sub">{p.sub}</div>
              <div className="price-wrap">
                <div className="price">{p.price}</div>
                <div className="emi-note">Pay in 3 segments of {p.emi}</div>
              </div>
              <ul>
                {p.features.map((f, j) => (
                  <li key={j}>
                    {f.icon}
                    <span>{f.text}</span>
                  </li>
                ))}
              </ul>
              <button className="btn-primary" style={{ width: "100%", marginTop: "auto" }} onClick={() => handleBook(p)}>Reserve Now</button>
            </div>
          ))}
        </div>

        <div className="compare-wrap">
          <div className="compare-title-wrap">
            <h3>◈ Premium Comparison</h3>
            <div className="compare-divider"></div>
          </div>
          <table className="compare-table">
            <thead>
              <tr>
                <th style={{ textAlign: "left", paddingLeft: "25px" }}>Exclusive Features</th>
                <th>Basic</th>
                <th className="highlight">Premium ⭐</th>
                <th>Royal</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Decoration Level</td><td>Standard</td><td className="highlight">Luxury Glass</td><td>Royal Gold</td></tr>
              <tr><td>Media Content</td><td><span className="check">✔ Photos</span></td><td className="highlight"><span className="check">✔ 4K Video</span></td><td><span className="check">✔ Cinematic Drone</span></td></tr>
              <tr><td>Live Entertainment</td><td><span className="cross">✘</span></td><td className="highlight"><span className="check">✔ DJ Set</span></td><td><span className="check">✔ Live Band</span></td></tr>
              <tr><td>Personal Assistant</td><td><span className="cross">✘</span></td><td className="highlight"><span className="check">✔ Dedicated</span></td><td><span className="check">✔ VIP Concierge</span></td></tr>
              <tr><td>EMI Flexibility</td><td><span className="check">✔</span></td><td className="highlight"><span className="check">✔</span></td><td><span className="check">✔</span></td></tr>
              <tr>
                <td><strong>Final Value</strong></td>
                <td>₹15,000</td>
                <td className="highlight" style={{ color: "var(--gold)", fontWeight: 600, fontSize: "15px" }}>₹35,000</td>
                <td>₹75,000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default Pricing;