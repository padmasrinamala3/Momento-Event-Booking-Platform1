import React, { useEffect, useRef } from "react";

const About = () => {
  const ref = useRef();
  useEffect(() => {
    const obs = new IntersectionObserver(
      es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.15 }
    );
    ref.current?.querySelectorAll(".reveal").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section id="about" className="about-section" ref={ref}>
      <div className="section-wrap">
        <div className="section-label">Our Story</div>
        <h2 className="section-title">Crafting <em>Extraordinary</em> Events</h2>
        <div className="about-text reveal">
          <p>MomentO is a premium event booking platform designed to make your celebrations simple, stress-free, and truly unforgettable.</p>
          <p>From grand weddings and intimate birthdays to corporate galas — we connect you with trusted vendors for catering, décor, photography, entertainment, and more.</p>
        </div>
        <div className="about-stats reveal">
          {[
            { num: "500+", label: "Events Hosted" },
            { num: "11", label: "Event Categories" },
            { num: "98%", label: "Happy Clients" },
            { num: "7+", label: "Years Exp." },
          ].map((s, i) => (
            <div key={i} className="stat-box">
              <div className="stat-num">{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
