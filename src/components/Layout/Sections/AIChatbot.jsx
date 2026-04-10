import { useState, useRef, useEffect } from "react";

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Welcome to MomentO ✨\n\nI'm here to help you plan your perfect event. Ask me about our services, pricing, or upcoming events!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const msgsRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    msgsRef.current?.scrollTo({
      top: msgsRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 220);
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system:
            "You are a luxury event planning assistant for MomentO, a premium event planning platform. Help users with event bookings, pricing, services, vendors, and planning. Be elegant, warm, and professional. Keep responses concise.",
          messages: updated,
        }),
      });
      const data = await res.json();
      const reply =
        data.content?.[0]?.text || "I apologize, please try again.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Unable to connect. Please try again." },
      ]);
    }
    setLoading(false);
  };

  const RobotIcon = ({ size = 40 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <line
        x1="32" y1="3" x2="32" y2="12"
        stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round"
      />
      <circle cx="32" cy="2" r="3.5" fill="#ec4899" />
      <ellipse cx="32" cy="29" rx="22" ry="20" fill="#6d28d9" />
      <ellipse cx="32" cy="27" rx="22" ry="20" fill="#a855f7" />
      <ellipse cx="32" cy="26" rx="20" ry="18" fill="#d8b4fe" />
      <ellipse cx="23" cy="24" rx="6.5" ry="6" fill="#1e1b4b" />
      <ellipse cx="41" cy="24" rx="6.5" ry="6" fill="#1e1b4b" />
      <ellipse cx="21" cy="22" rx="2" ry="2" fill="white" opacity="0.85" />
      <ellipse cx="39" cy="22" rx="2" ry="2" fill="white" opacity="0.85" />
      <path
        d="M22 35 Q32 44 42 35"
        stroke="#6d28d9" strokeWidth="2.5" strokeLinecap="round" fill="none"
      />
      <path
        d="M23 36 Q32 44 41 36"
        stroke="#ec4899" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7"
      />
      <ellipse cx="15" cy="31" rx="4" ry="3" fill="#ec4899" opacity="0.4" />
      <ellipse cx="49" cy="31" rx="4" ry="3" fill="#ec4899" opacity="0.4" />
      <ellipse cx="10" cy="28" rx="4.5" ry="5.5" fill="#a855f7" />
      <ellipse cx="10" cy="27" rx="3.5" ry="4.5" fill="#d8b4fe" />
      <ellipse cx="54" cy="28" rx="4.5" ry="5.5" fill="#a855f7" />
      <ellipse cx="54" cy="27" rx="3.5" ry="4.5" fill="#d8b4fe" />
      <rect x="25" y="46" width="14" height="7" rx="4" fill="#a855f7" />
      <rect x="26" y="45" width="12" height="5" rx="3" fill="#d8b4fe" />
    </svg>
  );

  return (
    <>
      <style>{`
        @keyframes robotFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes robotPulse {
          0%, 100% { box-shadow: 0 6px 24px rgba(168,85,247,0.45); }
          50% { box-shadow: 0 8px 36px rgba(168,85,247,0.75), 0 2px 16px rgba(236,72,153,0.35); }
        }
        @keyframes robotBlink {
          0%, 85%, 100% { transform: scaleY(1); }
          92% { transform: scaleY(0.05); }
        }
        .robot-float { animation: robotFloat 3s ease-in-out infinite; }
        .robot-fab-btn { animation: robotPulse 2.5s ease-in-out infinite; }
        .robot-fab-btn:hover { animation: none !important; box-shadow: 0 8px 36px rgba(168,85,247,0.7) !important; transform: scale(1.1); }
        .mo-chat-input { outline: none; }
        .mo-chat-input::placeholder { color: #3a3a3a; }
        .mo-chat-input:focus { border-color: rgba(168,85,247,0.65) !important; }
        .mo-close-btn:hover { color: #a855f7 !important; }
      `}</style>

      {/* FAB Button */}
      <button
        className="robot-fab-btn"
        onClick={() => setIsOpen((o) => !o)}
        style={{
          position: "fixed", bottom: 28, right: 28,
          width: 64, height: 64, borderRadius: "50%",
          background: "linear-gradient(145deg,#7c3aed,#a855f7)",
          border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999, transition: "transform 0.2s",
        }}
      >
        <div
          style={{
            position: "absolute", top: 8, right: 8,
            width: 11, height: 11, borderRadius: "50%",
            background: "#4CAF50", border: "2px solid #7c3aed",
          }}
        />
        <div className="robot-float">
          <RobotIcon size={40} />
        </div>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: "fixed", bottom: 104, right: 28,
            width: 352, height: 495,
            background: "#0d0d0d",
            border: "1px solid rgba(168,85,247,0.35)",
            borderRadius: 6, display: "flex", flexDirection: "column",
            overflow: "hidden", zIndex: 9998,
            fontFamily: "'Montserrat', sans-serif",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "14px 16px", background: "#0d0d0d",
              borderBottom: "1px solid rgba(168,85,247,0.25)",
              display: "flex", alignItems: "center", gap: 10,
            }}
          >
            <RobotIcon size={28} />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 17, color: "#C9A84C", letterSpacing: 1,
                }}
              >
                Moment<span style={{ color: "#fff" }}>O</span>
              </div>
              <div
                style={{
                  fontSize: 10, color: "#888",
                  letterSpacing: 1.5, textTransform: "uppercase",
                  display: "flex", alignItems: "center", gap: 5, marginTop: 2,
                }}
              >
                <span
                  style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: "#4CAF50", display: "inline-block",
                  }}
                />
                Online now
              </div>
            </div>
            <button
              className="mo-close-btn"
              onClick={() => setIsOpen(false)}
              style={{
                background: "none", border: "none",
                cursor: "pointer", color: "#555", fontSize: 15,
                transition: "color 0.15s",
              }}
            >
              ✕
            </button>
          </div>

          <div
            style={{
              height: 1,
              background:
                "linear-gradient(90deg,transparent,rgba(168,85,247,0.5),rgba(236,72,153,0.3),transparent)",
              margin: "0 16px",
            }}
          />

          {/* Messages */}
          <div
            ref={msgsRef}
            style={{
              flex: 1, overflowY: "auto",
              padding: "14px 13px",
              display: "flex", flexDirection: "column", gap: 10,
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  maxWidth: "83%", padding: "9px 13px",
                  fontSize: 12.5, lineHeight: 1.6,
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  background:
                    m.role === "user"
                      ? "linear-gradient(135deg,#7c3aed,#ec4899)"
                      : "#1a1a1a",
                  color: m.role === "user" ? "#fff" : "#ddd",
                  border:
                    m.role === "user"
                      ? "none"
                      : "0.5px solid rgba(168,85,247,0.2)",
                  borderRadius:
                    m.role === "user"
                      ? "10px 0 10px 10px"
                      : "0 10px 10px 10px",
                  fontWeight: m.role === "user" ? 500 : 400,
                  whiteSpace: "pre-wrap",
                }}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(168,85,247,0.6)",
                  fontStyle: "italic",
                }}
              >
                typing...
              </div>
            )}
          </div>

          <div
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 11, color: "rgba(168,85,247,0.35)",
              textAlign: "center", padding: "3px 0 5px", letterSpacing: 2,
            }}
          >
            ✦ we make your moments magical ✦
          </div>

          {/* Input Row */}
          <div
            style={{
              padding: "9px 11px",
              borderTop: "1px solid rgba(168,85,247,0.18)",
              display: "flex", gap: 8, alignItems: "flex-end",
              background: "#0d0d0d",
            }}
          >
            <textarea
              ref={inputRef}
              className="mo-chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask about events, pricing..."
              rows={1}
              style={{
                flex: 1, resize: "none",
                border: "0.5px solid rgba(168,85,247,0.25)",
                borderRadius: 3, padding: "8px 11px",
                fontSize: 12.5, background: "#111",
                color: "#ddd", maxHeight: 80,
                fontFamily: "'Montserrat', sans-serif",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                width: 34, height: 34, borderRadius: 3,
                background:
                  loading
                    ? "#2a2a2a"
                    : "linear-gradient(135deg,#7c3aed,#ec4899)",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "opacity 0.15s",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22 2L11 13"
                  stroke="#fff" strokeWidth="2.5" strokeLinecap="round"
                />
                <path
                  d="M22 2L15 22l-4-9-9-4 20-7z"
                  stroke="#fff" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}