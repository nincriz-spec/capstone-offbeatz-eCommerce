import { useState } from "react";
import axios from "axios";

export default function AssistantChat() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleSend(e) {
    e.preventDefault();
    const text = question.trim();
    if (!text || loading) return;

    // The conversation so far (before this question): the server uses the last few messages
    const history = messages.slice(-4);

    setMessages((prev) => [...prev, { from: "you", text }]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await axios.post("/api/assistant/chat", { question: text, history });
      setMessages((prev) => [...prev, { from: "assistant", text: res.data.answer }]);
    } catch (err) {
      const message = err.response?.data?.message || "Sorry, something went wrong.";
      setMessages((prev) => [...prev, { from: "assistant", text: message }]);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        className="chat-toggle"
        onClick={() => setOpen(true)}
        aria-label="Open chat assistant"
      >
        Chat with us
      </button>
    );
  }

  return (
    <div className="chat-box">
      <div className="chat-header">
        <span>Offbeatz assistant</span>
        <button
          className="chat-close"
          onClick={() => setOpen(false)}
          aria-label="Close chat"
        >
          ×
        </button>
      </div>

      <div className="chat-messages">
        <div>
          {messages.length === 0 && (
            <p className="chat-hint">
              Hi! Ask me about sizes, fabric, shipping or returns.
            </p>
          )}
          {messages.map((m, index) => (
            <p key={index} className={"chat-message chat-" + m.from}>
              {m.text}
            </p>
          ))}
          {loading && <p className="chat-hint">Crystallizing...</p>}
        </div>
      </div>

      <form className="chat-form" onSubmit={handleSend}>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={500}
          placeholder="Type your question"
          aria-label="Your question"
        />
        <button className="btn" type="submit" disabled={loading}>Send</button>
      </form>
    </div>
  );
}