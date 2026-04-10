import React from "react";

const Hero = () => {
  const navTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="home" className="hero-section">
      <div className="hero-bg" />
      <div className="hero-overlay" />
      <div className="hero-content">
        <div className="hero-eyebrow">✦ Premium Event Planning ✦</div>
        <h1>We Make Your<br /><em>Moments Magical</em></h1>
        <div className="hero-divider">
          <span style={{ position:"absolute", left:-14, top:-6, color:"var(--gold)", fontSize:8 }}>◆</span>
          <span style={{ position:"absolute", right:-14, top:-6, color:"var(--gold)", fontSize:8 }}>◆</span>
        </div>
        <p>Book your dream event with professional planning, curated vendors & premium services — all in one place.</p>
        <button className="btn-primary" onClick={() => navTo("events")}>Explore Events</button>
      </div>
      <div className="scroll-hint">
        <span>Scroll</span>
        <div className="scroll-line" />
      </div>
    </section>
  );
};

export default Hero;