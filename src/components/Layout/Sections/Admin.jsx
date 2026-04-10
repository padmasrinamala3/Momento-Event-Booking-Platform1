import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { showToast } from "../Layout/Layout";
import API_BASE from "../../../config/api";

// =====================================================================
//  ADMIN BOOKINGS SECTION — Drop this into your Admin.jsx
//  Replace the existing {/* Bookings */} section with this component
// =====================================================================

const AdminBookings = ({ onOpenInvoice }) => {
  const { bookings, setBookings } = useApp();
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");

  // ── Status change ──────────────────────────────────────────────────
  const changeStatus = async (index, newStatus) => {
    const booking = bookings[index];
    if (!booking) return;

    // Update local state immediately
    const updated = [...bookings];
    updated[index] = { ...updated[index], status: newStatus };
    setBookings(updated);

    // Show toast notification
    showToast(
      newStatus === "confirmed"
        ? "✓ Booking Confirmed"
        : newStatus === "cancelled"
        ? "✗ Booking Cancelled"
        : "⏳ Marked as Pending",
      newStatus === "confirmed" ? "success" : "processing"
    );

    // Update in MongoDB via API
    try {
      console.log("🚀 Updating booking status in MongoDB...");
      console.log("📦 Booking ID:", booking.id || booking._id);
      console.log("📦 Booking ID type:", typeof booking.id, typeof booking._id);
      console.log("📦 New Status:", newStatus);

      const bookingId = booking.id || booking._id || booking.bookingId;
      if (!bookingId) {
        console.error("❌ No booking ID found!");
        showToast("❌ Cannot update: No booking ID", "error");
        return;
      }

      const res = await fetch(`${API_BASE}/bookings/${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        const data = await res.json();
        console.log("✅ Status updated in MongoDB:", data);
        showToast("✓ Status saved to database", "success");
      } else {
        const errorData = await res.json();
        console.error("❌ Failed to update status in MongoDB:", errorData);
        showToast("⚠️ Status changed locally but not saved to database", "warning");
      }
    } catch (err) {
      console.error("❌ Network error updating status:", err);
      showToast("⚠️ Status changed locally. Server sync failed.", "warning");
    }
  };

  // ── Cancel booking ─────────────────────────────────────────────────
  const cancelBooking = (index, name) => {
    if (window.confirm(`"${name}" booking cancel చేయాలా?`)) {
      changeStatus(index, "cancelled");
    }
  };

  // ── Delete booking ─────────────────────────────────────────────────
  const deleteBooking = (index, name) => {
    if (window.confirm(`"${name}" booking పూర్తిగా delete చేయాలా?`)) {
      setBookings((prev) => prev.filter((_, i) => i !== index));
      showToast("✓ Booking deleted", "success");
    }
  };

  // ── Filter + Search ────────────────────────────────────────────────
  const filtered = bookings.filter((b) => {
    const matchStatus = filterStatus === "all" || b.status === filterStatus;
    const matchSearch =
      b.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.event?.toLowerCase().includes(search.toLowerCase()) ||
      b.id?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  // ── Status badge color ─────────────────────────────────────────────
  const statusColor = (s) =>
    s === "confirmed"
      ? { color: "#4caf50", border: "1px solid rgba(76,175,80,.35)" }
      : s === "cancelled"
      ? { color: "#f44336", border: "1px solid rgba(244,67,54,.35)" }
      : { color: "var(--gold)", border: "1px solid rgba(201,168,76,.35)" };

  const statusIcon = (s) =>
    s === "confirmed" ? "✓" : s === "cancelled" ? "✕" : "⏳";

  return (
    <div style={{ marginTop: 32 }}>
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <h3
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: 22,
            fontWeight: 300,
            color: "var(--gold)",
          }}
        >
          ◈ All Bookings
        </h3>
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
          {filtered.length} / {bookings.length} bookings
        </span>
      </div>

      {/* ── Search + Filter Bar ── */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        {/* Search */}
        <input
          placeholder="🔍 Search by name, event, ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: 180,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(201,168,76,.25)",
            borderRadius: 8,
            padding: "8px 12px",
            color: "var(--text-main, #fff)",
            fontSize: 12,
            outline: "none",
          }}
        />

        {/* Filter Buttons */}
        {["all", "confirmed", "pending", "cancelled"].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            style={{
              fontSize: 11,
              padding: "8px 14px",
              borderRadius: 20,
              border:
                filterStatus === s
                  ? "1px solid var(--gold)"
                  : "1px solid rgba(201,168,76,.2)",
              background:
                filterStatus === s
                  ? "rgba(201,168,76,.15)"
                  : "transparent",
              color: filterStatus === s ? "var(--gold)" : "var(--text-muted)",
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* ── Booking Cards ── */}
      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            color: "var(--text-muted)",
            padding: "40px 0",
            fontSize: 13,
          }}
        >
          No bookings found.
        </div>
      ) : (
        filtered.map((b, i) => {
          // Find real index in original bookings array
          const realIndex = bookings.indexOf(b);

          return (
            <div
              key={b.id || i}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(201,168,76,.12)",
                borderRadius: 12,
                padding: "16px 18px",
                marginBottom: 12,
                transition: "border-color 0.2s",
              }}
            >
              {/* ── Top Row: ID + Status Badge ── */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                  flexWrap: "wrap",
                  gap: 6,
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    color: "var(--gold)",
                    fontSize: 11,
                    fontFamily: "monospace",
                  }}
                >
                  {b.id}
                </span>

                {/* Status Badge — shows current status */}
                <span
                  style={{
                    fontSize: 10,
                    padding: "3px 12px",
                    borderRadius: 20,
                    textTransform: "capitalize",
                    ...statusColor(b.status),
                  }}
                >
                  {statusIcon(b.status)} {b.status}
                </span>
              </div>

              {/* ── Booking Details ── */}
              <div
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: 16,
                  marginBottom: 2,
                }}
              >
                {b.name}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  marginBottom: 2,
                }}
              >
                {b.event}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  marginBottom: 12,
                }}
              >
                📅 {b.date} · ₹
                {typeof b.price === "number"
                  ? b.price.toLocaleString("en-IN")
                  : b.price}
              </div>

              {/* ── Action Buttons ── */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                {/* Invoice */}
                <button
                  className="btn-invoice"
                  onClick={() => onOpenInvoice(b.id)}
                >
                  📄 Invoice
                </button>

                {/* Confirm Button — only show if not confirmed */}
                {b.status !== "confirmed" && (
                  <button
                    onClick={() => changeStatus(realIndex, "confirmed")}
                    style={{
                      fontSize: 11,
                      padding: "8px 14px",
                      borderRadius: 8,
                      border: "1px solid rgba(76,175,80,.4)",
                      background: "rgba(76,175,80,.12)",
                      color: "#4caf50",
                      cursor: "pointer",
                    }}
                  >
                    ✓ Confirm
                  </button>
                )}

                {/* Pending Button — only show if confirmed */}
                {b.status === "confirmed" && (
                  <button
                    onClick={() => changeStatus(realIndex, "pending")}
                    style={{
                      fontSize: 11,
                      padding: "8px 14px",
                      borderRadius: 8,
                      border: "1px solid rgba(201,168,76,.4)",
                      background: "rgba(201,168,76,.12)",
                      color: "var(--gold)",
                      cursor: "pointer",
                    }}
                  >
                    ⏳ Mark Pending
                  </button>
                )}

                {/* Cancel Button — only show if not cancelled */}
                {b.status !== "cancelled" && (
                  <button
                    onClick={() => cancelBooking(realIndex, b.name)}
                    style={{
                      fontSize: 11,
                      padding: "8px 14px",
                      borderRadius: 8,
                      border: "1px solid rgba(244,67,54,.4)",
                      background: "rgba(244,67,54,.12)",
                      color: "#f44336",
                      cursor: "pointer",
                    }}
                  >
                    ✕ Cancel
                  </button>
                )}

                {/* Delete Button */}
                <button
                  onClick={() => deleteBooking(realIndex, b.name)}
                  style={{
                    fontSize: 11,
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "1px solid rgba(180,50,50,.3)",
                    background: "rgba(180,50,50,.08)",
                    color: "#c0392b",
                    cursor: "pointer",
                    marginLeft: "auto",
                  }}
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default AdminBookings;
