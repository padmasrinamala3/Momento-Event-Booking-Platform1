import React, { useEffect, useRef } from "react";
import { useApp } from "../../context/AppContext";
import { showToast } from "../Layout/Layout";

const Events = ({ onReserve, onViewThemes }) => {
  const { eventsData, loggedInUser } = useApp();
  const ref = useRef();

  useEffect(() => {
    const obs = new IntersectionObserver(
      (es) => { es.forEach((e, i) => { if (e.isIntersecting) setTimeout(() => e.target.classList.add("visible"), i * 70); }); },
      { threshold: 0.1 }
    );
    ref.current?.querySelectorAll(".reveal").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [eventsData]);

  const handleReserve = (event) => {
    if (!loggedInUser) {
      showToast("⚠ Please login to book an event", "processing");
      document.getElementById("userAuth")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    onReserve(event);
  };

  // Premium badges logic
  const getBadge = (name) => {
    if (["Wedding", "Half Saree Function", "Birthday"].includes(name)) return <span className="trending-badge">Trending</span>;
    if (["Music Concert", "College Fest"].includes(name)) return <span className="trending-badge new">New</span>;
    return null;
  };

  // Mock starting prices
  const getStartingPrice = (name) => {
    const prices = {
      "Wedding": "₹70,000",
      "Birthday": "₹3,500",
      "Corporate Event": "₹18,000",
      "Engagement": "₹12,000",
      "Baby Shower": "₹5,000",
      "House Warming": "₹3,500",
      "Farewell Party": "₹5,000",
      "Anniversary": "₹5,000",
      "College Fest": "₹18,000",
      "Music Concert": "₹40,000",
      "Half Saree Function": "₹12,000"
    };
    return prices[name] || "₹5,000";
  };

  return (
    <section id="events">
      <div className="section-wrap">
        <div className="section-label">Exclusive Events</div>
        <h2 className="section-title">Experience <em>Luxury</em> Planning</h2>
        <div className="events-grid" ref={ref}>
          {eventsData.filter(e => e.status === "active").map((e, index) => (
            <div key={index} className="event-card reveal">
              <div className="event-card-img-wrap" onClick={() => onViewThemes(e)}>
                <img className="event-card-img" src={e.img} loading="lazy" alt={e.name}
                  onError={ev => ev.target.src = "https://i.pinimg.com/736x/e4/2b/55/e42b5578b225b29e8b65010a975a2d1e.jpg"} />
                {getBadge(e.name)}
                <div className="img-overlay-hint">View Gallery</div>
              </div>
              <div className="event-card-body">
                <div className="event-card-info">
                  <span className="event-card-tag">{e.tag}</span>
                  <span className="event-card-price">From {getStartingPrice(e.name)}</span>
                </div>
                <div className="event-card-name">{e.name}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "15px" }}>
                  <button className="event-card-btn" onClick={() => handleReserve(e)} style={{ margin: 0 }}>
                    Reserve
                  </button>
                  <button className="event-card-btn outline" onClick={() => onViewThemes(e)} style={{ margin: 0, background: "transparent", border: "1px solid var(--gold)", color: "var(--gold)" }}>
                    Themes
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Events;