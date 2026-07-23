"use client";
import { useState } from "react";
import { Plus, Trash2, Pencil, X, CheckCircle2 } from "lucide-react";
import GlowingCard from "@/components/ui/GlowingCard";

type Question = {
  id: string;
  order: number;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string | null;
};
type Quiz = { id: string; title: string; passScore: number; questions: Question[] };

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px",
  background: "rgba(109,40,217,0.04)",
  border: "1px solid rgba(109,40,217,0.2)",
  borderRadius: 8,
  fontFamily: "var(--font-body)", fontSize: 14, color: "#0A1535",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.68)",
  marginBottom: 6, display: "block",
};

function parseOptionsIfNeeded(options: unknown): string[] {
  if (Array.isArray(options)) return options;
  try {
    const parsed = JSON.parse(options as string);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function QuestionForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial?: Question;
  onSave: (data: { text: string; options: string[]; correctIndex: number; explanation?: string }) => void;
  onCancel?: () => void;
  saving: boolean;
}) {
  const [text, setText] = useState(initial?.text || "");
  const [options, setOptions] = useState<string[]>(initial?.options?.length ? initial.options : ["", ""]);
  const [correctIndex, setCorrectIndex] = useState(initial?.correctIndex ?? 0);
  const [explanation, setExplanation] = useState(initial?.explanation || "");
  const [error, setError] = useState("");

  const updateOption = (i: number, value: string) => {
    setOptions((prev) => prev.map((o, oi) => (oi === i ? value : o)));
  };
  const addOption = () => setOptions((prev) => [...prev, ""]);
  const removeOption = (i: number) => {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((_, oi) => oi !== i));
    if (correctIndex >= options.length - 1) setCorrectIndex(0);
  };

  const submit = () => {
    setError("");
    const trimmed = options.map((o) => o.trim());
    if (!text.trim()) { setError("Question text is required."); return; }
    if (trimmed.some((o) => !o)) { setError("All options must have text."); return; }
    if (correctIndex < 0 || correctIndex >= trimmed.length) { setError("Select a valid correct answer."); return; }
    onSave({ text: text.trim(), options: trimmed, correctIndex, explanation: explanation.trim() || undefined });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {error && <p style={{ color: "#DC2626", fontSize: 12.5, fontFamily: "var(--font-body)" }}>{error}</p>}
      <div>
        <label style={labelStyle}>Question</label>
        <textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} style={{ ...inputStyle, resize: "vertical" }} placeholder="What does the question ask?" />
      </div>
      <div>
        <label style={labelStyle}>Options — select the radio next to the correct answer</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {options.map((opt, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="radio"
                name="correctIndex"
                checked={correctIndex === i}
                onChange={() => setCorrectIndex(i)}
                style={{ accentColor: "#6D28D9", flexShrink: 0 }}
              />
              <input value={opt} onChange={(e) => updateOption(i, e.target.value)} style={inputStyle} placeholder={`Option ${i + 1}`} />
              {options.length > 2 && (
                <button type="button" onClick={() => removeOption(i)} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4, flexShrink: 0 }}>
                  <X size={15} color="rgba(10,21,53,0.4)" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button type="button" onClick={addOption} className="btn-ghost" style={{ fontSize: 12, padding: "6px 12px", marginTop: 8 }}>
          <Plus size={13} /> Add Option
        </button>
      </div>
      <div>
        <label style={labelStyle}>Explanation (optional, shown after submission)</label>
        <textarea rows={2} value={explanation} onChange={(e) => setExplanation(e.target.value)} style={{ ...inputStyle, resize: "vertical" }} placeholder="Why is this the correct answer?" />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button type="button" onClick={submit} disabled={saving} className="btn-primary" style={{ fontSize: 13, padding: "9px 18px", opacity: saving ? 0.6 : 1 }}>
          {saving ? "Saving..." : initial ? "Save Question" : "Add Question"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-ghost" style={{ fontSize: 13, padding: "9px 18px" }}>Cancel</button>
        )}
      </div>
    </div>
  );
}

export default function AdminQuizBuilder({ courseId, initialQuiz }: { courseId: string; initialQuiz: Quiz | null }) {
  const [quiz, setQuiz] = useState(initialQuiz);
  const [title, setTitle] = useState(initialQuiz?.title || "Course Quiz");
  const [passScore, setPassScore] = useState(initialQuiz?.passScore ?? 70);
  const [creating, setCreating] = useState(false);
  const [savingMeta, setSavingMeta] = useState(false);
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const createQuiz = async () => {
    setCreating(true);
    setMessage("");
    try {
      const res = await fetch(`/api/courses/${courseId}/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, passScore }),
      });
      const data = await res.json();
      if (!res.ok) { setMessage(data.error || "Could not create quiz."); return; }
      setQuiz({ ...data.quiz, questions: [] });
    } catch {
      setMessage("Network error.");
    } finally {
      setCreating(false);
    }
  };

  const saveMeta = async () => {
    setSavingMeta(true);
    setMessage("");
    try {
      const res = await fetch(`/api/courses/${courseId}/quiz`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, passScore }),
      });
      const data = await res.json();
      if (!res.ok) { setMessage(data.error || "Could not save."); return; }
      setQuiz((prev) => (prev ? { ...prev, title: data.quiz.title, passScore: data.quiz.passScore } : prev));
      setMessage("Saved.");
    } catch {
      setMessage("Network error.");
    } finally {
      setSavingMeta(false);
    }
  };

  const addQuestion = async (data: { text: string; options: string[]; correctIndex: number; explanation?: string }) => {
    if (!quiz) return;
    setBusyId("new");
    setMessage("");
    try {
      const res = await fetch(`/api/courses/${courseId}/quiz/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) { setMessage(body.error || "Could not add question."); return; }
      const question: Question = { ...body.question, options: parseOptionsIfNeeded(body.question.options) };
      setQuiz((prev) => (prev ? { ...prev, questions: [...prev.questions, question] } : prev));
      setAddingQuestion(false);
    } catch {
      setMessage("Network error.");
    } finally {
      setBusyId(null);
    }
  };

  const updateQuestion = async (questionId: string, data: { text: string; options: string[]; correctIndex: number; explanation?: string }) => {
    setBusyId(questionId);
    setMessage("");
    try {
      const res = await fetch(`/api/quiz/questions/${questionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) { setMessage(body.error || "Could not update question."); return; }
      const question: Question = { ...body.question, options: parseOptionsIfNeeded(body.question.options) };
      setQuiz((prev) => (prev ? { ...prev, questions: prev.questions.map((q) => (q.id === questionId ? question : q)) } : prev));
      setEditingId(null);
    } catch {
      setMessage("Network error.");
    } finally {
      setBusyId(null);
    }
  };

  const deleteQuestion = async (questionId: string) => {
    setBusyId(questionId);
    setMessage("");
    try {
      const res = await fetch(`/api/quiz/questions/${questionId}`, { method: "DELETE" });
      if (!res.ok) { setMessage("Could not delete question."); return; }
      setQuiz((prev) => (prev ? { ...prev, questions: prev.questions.filter((q) => q.id !== questionId) } : prev));
    } catch {
      setMessage("Network error.");
    } finally {
      setBusyId(null);
    }
  };

  if (!quiz) {
    return (
      <GlowingCard style={{ padding: "28px 30px", maxWidth: 480 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 500, color: "#0A1535", marginBottom: 18 }}>
          This course has no quiz yet
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelStyle}>Quiz Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Pass Score (%)</label>
            <input type="number" min={1} max={100} value={passScore} onChange={(e) => setPassScore(Number(e.target.value))} style={inputStyle} />
          </div>
          {message && <p style={{ color: "#DC2626", fontSize: 12.5, fontFamily: "var(--font-body)" }}>{message}</p>}
          <button onClick={createQuiz} disabled={creating} className="btn-primary" style={{ opacity: creating ? 0.6 : 1 }}>
            {creating ? "Creating..." : "Create Quiz"}
          </button>
        </div>
      </GlowingCard>
    );
  }

  return (
    <div>
      <GlowingCard style={{ padding: "22px 24px", marginBottom: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 160px 140px", gap: 12, alignItems: "end" }}>
          <div>
            <label style={labelStyle}>Quiz Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Pass Score (%)</label>
            <input type="number" min={1} max={100} value={passScore} onChange={(e) => setPassScore(Number(e.target.value))} style={inputStyle} />
          </div>
          <button onClick={saveMeta} disabled={savingMeta} className="btn-ghost" style={{ fontSize: 13, padding: "10px 16px", opacity: savingMeta ? 0.6 : 1 }}>
            {savingMeta ? "Saving..." : "Save"}
          </button>
        </div>
        {message && <p style={{ color: message === "Saved." ? "#16A34A" : "#DC2626", fontSize: 12.5, fontFamily: "var(--font-body)", marginTop: 10 }}>{message}</p>}
      </GlowingCard>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
        {quiz.questions.map((q, i) => (
          <GlowingCard key={q.id} style={{ padding: "20px 22px" }}>
            {editingId === q.id ? (
              <QuestionForm
                initial={q}
                saving={busyId === q.id}
                onSave={(data) => updateQuestion(q.id, data)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#0A1535", fontWeight: 600 }}>{i + 1}. {q.text}</p>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => setEditingId(q.id)} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 6 }}>
                      <Pencil size={15} color="#6D28D9" />
                    </button>
                    <button onClick={() => deleteQuestion(q.id)} disabled={busyId === q.id} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 6 }}>
                      <Trash2 size={15} color="#DC2626" />
                    </button>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {q.options.map((opt, oi) => (
                    <div key={oi} style={{
                      display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-body)", fontSize: 13,
                      padding: "6px 10px", borderRadius: 6,
                      color: oi === q.correctIndex ? "#16A34A" : "rgba(10,21,53,0.6)",
                      background: oi === q.correctIndex ? "rgba(34,197,94,0.08)" : "transparent",
                    }}>
                      {oi === q.correctIndex && <CheckCircle2 size={13} />}
                      {opt}
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.68)", marginTop: 10 }}>{q.explanation}</p>
                )}
              </>
            )}
          </GlowingCard>
        ))}
      </div>

      {addingQuestion ? (
        <GlowingCard style={{ padding: "20px 22px" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 500, color: "#0A1535", marginBottom: 14 }}>New Question</h3>
          <QuestionForm saving={busyId === "new"} onSave={addQuestion} onCancel={() => setAddingQuestion(false)} />
        </GlowingCard>
      ) : (
        <button onClick={() => setAddingQuestion(true)} className="btn-primary">
          <Plus size={15} /> Add Question
        </button>
      )}
    </div>
  );
}
