"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "How does certification grow my revenue?",
  "Which sectors can be certified?",
  "How long does the process take?",
  "Can any business apply for halal certification?",
];

const INITIAL_MSG: Message = {
  role: "assistant",
  content: "Hello! I'm **DARI** — your Digital Assistant for Regulatory Intelligence.\n\nI help businesses of all backgrounds navigate halal certification to access quality-assured global markets. What would you like to know?",
};

export default function DARIChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MSG]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.content || "I apologize, I could not process that request. Please try again." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Connection issue. Please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  };

  const navyGrad = "linear-gradient(135deg, #1B2A7B, #162060)";
  const goldGrad = "linear-gradient(135deg, #F5C842, #B8890A)";

  return (
    <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 1200 }}>
      {/* Launcher bubble */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            title="Chat with DARI"
            style={{
              width: 64, height: 64, borderRadius: "50%",
              background: navyGrad,
              border: "3px solid #F5C842",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 32px rgba(27,42,123,0.4)",
              flexDirection: "column", gap: 1,
            }}
          >
            <Bot size={22} color="#F5C842" />
            <span style={{ fontFamily: "var(--font-accent)", fontSize: 8, color: "#F5C842", letterSpacing: "0.15em", fontWeight: 700 }}>DARI</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              position: "absolute", bottom: 0, right: 0,
              width: 390, height: 540,
              borderRadius: 20, overflow: "hidden",
              background: "rgba(253,252,250,0.98)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(27,42,123,0.15)",
              boxShadow: "0 24px 80px rgba(27,42,123,0.2)",
              display: "flex", flexDirection: "column",
            }}
          >
            {/* Header */}
            <div style={{ padding: "14px 18px", background: navyGrad, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: goldGrad, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Bot size={18} color="white" />
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-accent)", fontSize: 15, fontWeight: 700, color: "#F5C842", letterSpacing: "0.12em" }}>DARI</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "rgba(255,255,255,0.75)", letterSpacing: "0.04em" }}>
                    Digital Assistant &mdash; Regulatory Intelligence
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{ background: "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", color: "white", display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: "50%", transition: "background 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
              >
                <X size={14} />
              </button>
            </div>

            {/* Acronym strip */}
            <div style={{ padding: "8px 18px", background: "rgba(27,42,123,0.04)", borderBottom: "1px solid rgba(27,42,123,0.08)", display: "flex", gap: 16, justifyContent: "center" }}>
              {[["D","igital"],["A","ssistant for"],["R","egulatory"],["I","ntelligence"]].map(([bold, rest]) => (
                <span key={bold} style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--color-text-muted)" }}>
                  <strong style={{ color: "#1B2A7B" }}>{bold}</strong>{rest}
                </span>
              ))}
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 8px", display: "flex", flexDirection: "column", gap: 10 }}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 }}
                  style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}
                >
                  <div style={{
                    maxWidth: "84%",
                    padding: "10px 14px",
                    borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
                    background: msg.role === "user" ? navyGrad : "white",
                    color: msg.role === "user" ? "white" : "var(--color-text-primary)",
                    fontFamily: "var(--font-body)",
                    fontSize: 13,
                    lineHeight: 1.65,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    border: msg.role === "assistant" ? "1px solid rgba(27,42,123,0.1)" : "none",
                  }}>
                    {msg.role === "assistant" ? (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div style={{ display: "flex", gap: 5, padding: "12px 16px", background: "white", borderRadius: "4px 18px 18px 18px", width: "fit-content", border: "1px solid rgba(27,42,123,0.1)" }}>
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length <= 1 && (
              <div style={{ padding: "4px 12px 8px", display: "flex", gap: 6, flexWrap: "wrap" }}>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    style={{ padding: "5px 12px", background: "rgba(27,42,123,0.05)", border: "1px solid rgba(27,42,123,0.15)", borderRadius: 20, fontFamily: "var(--font-body)", fontSize: 11, color: "#1B2A7B", cursor: "pointer", transition: "all 0.2s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(27,42,123,0.1)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(27,42,123,0.05)")}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div style={{ padding: "8px 12px 14px", borderTop: "1px solid rgba(27,42,123,0.08)" }}>
              <div
                style={{ display: "flex", gap: 8, background: "white", border: "1.5px solid rgba(27,42,123,0.15)", borderRadius: 12, padding: "8px 12px", transition: "border-color 0.3s" }}
                onFocusCapture={e => (e.currentTarget.style.borderColor = "#1B2A7B")}
                onBlurCapture={e => (e.currentTarget.style.borderColor = "rgba(27,42,123,0.15)")}
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
                  placeholder="Ask about certification, markets, compliance..."
                  style={{ flex: 1, border: "none", outline: "none", fontFamily: "var(--font-body)", fontSize: 13, color: "var(--color-text-primary)", background: "transparent" }}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading}
                  style={{ width: 32, height: 32, borderRadius: "50%", background: input.trim() ? navyGrad : "var(--color-border)", border: "none", cursor: input.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", flexShrink: 0 }}
                >
                  <Send size={13} color="white" />
                </button>
              </div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--color-text-muted)", textAlign: "center", marginTop: 6 }}>
                DARI &mdash; Dar Al Halal Certification AI
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
