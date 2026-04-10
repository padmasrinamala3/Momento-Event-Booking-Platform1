import React, { useState } from "react";

const AvailabilityCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const BOOKED = [3, 8, 14, 19, 22, 27];
  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const year = currentDate.getFullYear(), month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  const today = new Date();

  return (
    <section id="calendar" className="calendar-section">
      <div className="section-wrap">
        <div className="section-label">Availability</div>
        <h2 className="section-title">Event <em>Calendar</em></h2>
        <p className="section-sub">Check available dates and plan your event accordingly.</p>
        <div className="cal-wrap">
          <div className="cal-nav">
            <button className="cal-nav-btn" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>‹</button>
            <div className="cal-month">{MONTHS[month]} {year}</div>
            <button className="cal-nav-btn" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>›</button>
          </div>
          <div className="cal-days-header">
            {DAYS.map(d => <div key={d} className="cal-day-label">{d}</div>)}
          </div>
          <div className="cal-grid">
            {cells.map((day, i) => {
              if (!day) return <div key={i} />;
              const isBooked = BOOKED.includes(day), isSel = selectedDay === day;
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              return (
                <button key={i}
                  className={`cal-cell${isBooked ? " booked" : ""}${isSel ? " selected" : ""}${isToday ? " today" : ""}`}
                  onClick={() => !isBooked && setSelectedDay(day)}
                  disabled={isBooked}>
                  {day}
                </button>
              );
            })}
          </div>
          <div className="cal-legend">
            <div className="cal-legend-item"><div className="cal-dot available" />Available</div>
            <div className="cal-legend-item"><div className="cal-dot booked-dot" />Booked</div>
            <div className="cal-legend-item"><div className="cal-dot today-dot" />Today</div>
          </div>
          {selectedDay && (
            <div className="cal-selected-msg">✦ {MONTHS[month]} {selectedDay}, {year} — Available for booking!</div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AvailabilityCalendar;