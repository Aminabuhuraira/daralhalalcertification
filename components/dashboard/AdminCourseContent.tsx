"use client";
import { useState } from "react";
import { ChevronDown, ChevronRight, Video, FileText, Plus, Pencil, Trash2, Check, X, Loader2 } from "lucide-react";

type Lesson = {
  id: string;
  title: string;
  order: number;
  contentMd: string;
  videoUrl: string | null;
  durationMin: number;
};

type Module = {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
};

type Course = {
  id: string;
  title: string;
  modules: Module[];
};

const inStyle: React.CSSProperties = {
  border: "1px solid #e5e5e5", borderRadius: 6, padding: "7px 10px",
  fontSize: 13, fontFamily: "var(--font-body)", color: "#111", outline: "none",
};

function isValidUrl(v: string) {
  try { new URL(v); return true; } catch { return false; }
}

function VideoChip({ url }: { url: string }) {
  const label = /youtube\.com|youtu\.be/.test(url) ? "YouTube" : /vimeo\.com/.test(url) ? "Vimeo" : "Video";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(201,162,39,0.12)", border: "1px solid rgba(201,162,39,0.3)", borderRadius: 6, padding: "2px 8px", fontSize: 11.5, color: "#9a7a10", fontWeight: 500 }}>
      <Video size={11} /> {label}
    </span>
  );
}

// ── inline field editor ────────────────────────────────────────────────────────

function InlineEditor({
  lessonId, field, current, placeholder, multiline, onSaved,
}: {
  lessonId: string; field: string; current: string | null; placeholder: string; multiline?: boolean; onSaved: (val: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState(current ?? "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const save = async () => {
    const trimmed = val.trim();
    if (field === "videoUrl" && trimmed && !isValidUrl(trimmed)) { setErr("Enter a valid URL"); return; }
    setSaving(true); setErr("");
    const res = await fetch(`/api/lessons/${lessonId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: trimmed || null }),
    });
    setSaving(false);
    if (res.ok) { onSaved(trimmed || null); setOpen(false); }
    else setErr("Failed to save");
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="btn-ghost"
        style={{ fontSize: 12, padding: "5px 10px", display: "flex", alignItems: "center", gap: 6 }}
      >
        <Pencil size={12} /> {current ? `Edit ${field === "videoUrl" ? "video" : "content"}` : `Add ${field === "videoUrl" ? "video" : "content"}`}
      </button>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
      <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
        {multiline ? (
          <textarea
            autoFocus value={val}
            onChange={e => { setVal(e.target.value); setErr(""); }}
            placeholder={placeholder}
            rows={5}
            style={{ ...inStyle, flex: 1, resize: "vertical" }}
            onFocus={e => (e.currentTarget.style.borderColor = "#C9A227")}
            onBlur={e => (e.currentTarget.style.borderColor = "#e5e5e5")}
          />
        ) : (
          <input
            autoFocus value={val}
            onChange={e => { setVal(e.target.value); setErr(""); }}
            placeholder={placeholder}
            style={{ ...inStyle, flex: 1 }}
            onFocus={e => (e.currentTarget.style.borderColor = "#C9A227")}
            onBlur={e => (e.currentTarget.style.borderColor = "#e5e5e5")}
          />
        )}
        <button onClick={save} disabled={saving} className="btn-primary" style={{ padding: "6px 10px", fontSize: 12, flexShrink: 0 }}>
          {saving ? <Loader2 size={12} style={{ animation: "rotateSeal 1s linear infinite" }} /> : <Check size={13} />}
        </button>
        <button onClick={() => { setOpen(false); setVal(current ?? ""); setErr(""); }} className="btn-ghost" style={{ padding: "6px 10px", fontSize: 12, flexShrink: 0 }}>
          <X size={13} />
        </button>
      </div>
      {err && <p style={{ fontSize: 12, color: "#dc2626" }}>{err}</p>}
    </div>
  );
}

// ── add lesson form ────────────────────────────────────────────────────────────

function AddLessonForm({ courseId, moduleId, onAdded }: { courseId: string; moduleId: string; onAdded: (lesson: Lesson) => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setErr("Title is required"); return; }
    const url = videoUrl.trim();
    if (url && !isValidUrl(url)) { setErr("Enter a valid video URL"); return; }
    setSaving(true); setErr("");
    const res = await fetch(`/api/courses/${courseId}/modules/${moduleId}/lessons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), contentMd: "", videoUrl: url || null }),
    });
    setSaving(false);
    if (res.ok) {
      const { lesson } = await res.json();
      onAdded(lesson);
      setTitle(""); setVideoUrl(""); setOpen(false);
    } else {
      setErr("Failed to add lesson");
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "1.5px dashed rgba(201,162,39,0.4)", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 13, color: "rgba(10,21,53,0.45)", fontFamily: "var(--font-body)", width: "100%", transition: "border-color 0.2s, color 0.2s" }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#C9A227"; (e.currentTarget as HTMLButtonElement).style.color = "#9a7a10"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(201,162,39,0.4)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(10,21,53,0.45)"; }}
      >
        <Plus size={14} /> Add lesson
      </button>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 8, padding: "14px", background: "rgba(201,162,39,0.04)", borderRadius: 10, border: "1px solid rgba(201,162,39,0.15)" }}>
      <p style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 500, color: "#0A1535", margin: 0 }}>New Lesson</p>
      <input autoFocus required value={title} onChange={e => setTitle(e.target.value)} placeholder="Lesson title" style={inStyle} />
      <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="Video URL (optional)" style={inStyle} />
      {err && <p style={{ fontSize: 12, color: "#dc2626", margin: 0 }}>{err}</p>}
      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" disabled={saving} className="btn-primary" style={{ fontSize: 12.5, padding: "7px 16px" }}>
          {saving ? <Loader2 size={13} style={{ animation: "rotateSeal 1s linear infinite" }} /> : "Add Lesson"}
        </button>
        <button type="button" onClick={() => { setOpen(false); setErr(""); }} className="btn-ghost" style={{ fontSize: 12.5, padding: "7px 16px" }}>Cancel</button>
      </div>
    </form>
  );
}

// ── add module form ────────────────────────────────────────────────────────────

function AddModuleForm({ courseId, onAdded }: { courseId: string; onAdded: (mod: Module) => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setErr("Title is required"); return; }
    setSaving(true); setErr("");
    const res = await fetch(`/api/courses/${courseId}/modules`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: title.trim() }) });
    setSaving(false);
    if (res.ok) { const { module: mod } = await res.json(); onAdded({ ...mod, lessons: [] }); setTitle(""); setOpen(false); }
    else setErr("Failed to add module");
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary" style={{ fontSize: 13, padding: "9px 18px", display: "flex", alignItems: "center", gap: 6 }}>
        <Plus size={14} /> Add Module
      </button>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <input autoFocus required value={title} onChange={e => setTitle(e.target.value)} placeholder="Module title" style={{ ...inStyle, flex: 1 }} />
      <button type="submit" disabled={saving} className="btn-primary" style={{ fontSize: 13, padding: "8px 16px" }}>
        {saving ? <Loader2 size={13} style={{ animation: "rotateSeal 1s linear infinite" }} /> : "Save"}
      </button>
      <button type="button" onClick={() => setOpen(false)} className="btn-ghost" style={{ fontSize: 13, padding: "8px 14px" }}>Cancel</button>
      {err && <p style={{ fontSize: 12, color: "#dc2626", margin: 0 }}>{err}</p>}
    </form>
  );
}

// ── lesson row ─────────────────────────────────────────────────────────────────

function LessonRow({ lesson, courseId, moduleId, onUpdate, onDelete }: {
  lesson: Lesson; courseId: string; moduleId: string; onUpdate: (l: Lesson) => void; onDelete: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const remove = async () => {
    if (!confirm(`Delete lesson "${lesson.title}"?`)) return;
    setDeleting(true);
    await fetch(`/api/lessons/${lesson.id}`, { method: "DELETE" });
    onDelete(lesson.id);
  };

  return (
    <div style={{ background: "#fafafa", borderRadius: 8, border: "1px solid #f0f0f0", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px" }}>
        <Video size={14} color={lesson.videoUrl ? "#C9A227" : "#ccc"} style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "#111", margin: 0, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {lesson.title}
          </p>
          {lesson.videoUrl && <div style={{ marginTop: 3 }}><VideoChip url={lesson.videoUrl} /></div>}
        </div>
        <button
          onClick={() => setExpanded(v => !v)}
          className="btn-ghost"
          style={{ fontSize: 12, padding: "4px 8px", display: "flex", alignItems: "center", gap: 4 }}
        >
          <FileText size={12} /> {expanded ? "Hide content" : "Edit content"}
        </button>
        <InlineEditor
          lessonId={lesson.id} field="videoUrl" current={lesson.videoUrl}
          placeholder="https://youtube.com/watch?v=..."
          onSaved={(url) => onUpdate({ ...lesson, videoUrl: url })}
        />
        <button
          onClick={remove} disabled={deleting}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", display: "flex", alignItems: "center", padding: 4, borderRadius: 4 }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "#ef4444")}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "#ccc")}
        >
          {deleting ? <Loader2 size={14} style={{ animation: "rotateSeal 1s linear infinite" }} /> : <Trash2 size={14} />}
        </button>
      </div>
      {expanded && (
        <div style={{ padding: "0 14px 12px", borderTop: "1px solid #f0f0f0" }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 11.5, color: "rgba(10,21,53,0.4)", margin: "8px 0 6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Lesson Content (Markdown)</p>
          <InlineEditor
            lessonId={lesson.id} field="contentMd" current={lesson.contentMd || ""}
            placeholder="Write lesson content in Markdown..."
            multiline
            onSaved={(md) => onUpdate({ ...lesson, contentMd: md ?? "" })}
          />
          {lesson.contentMd && (
            <p style={{ fontFamily: "var(--font-body)", fontSize: 11.5, color: "rgba(10,21,53,0.4)", marginTop: 6 }}>
              {lesson.contentMd.length} characters saved.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── module accordion ───────────────────────────────────────────────────────────

function ModuleAccordion({ mod, courseId, onUpdate, onDelete }: {
  mod: Module; courseId: string; onUpdate: (m: Module) => void; onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const [renaming, setRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(mod.title);
  const [renaming_saving, setRenamingSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const saveRename = async () => {
    if (!newTitle.trim()) return;
    setRenamingSaving(true);
    const res = await fetch(`/api/courses/${courseId}/modules/${mod.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim() }),
    });
    setRenamingSaving(false);
    if (res.ok) { onUpdate({ ...mod, title: newTitle.trim() }); setRenaming(false); }
  };

  const deleteMod = async () => {
    if (!confirm(`Delete module "${mod.title}" and all its lessons?`)) return;
    setDeleting(true);
    await fetch(`/api/courses/${courseId}/modules/${mod.id}`, { method: "DELETE" });
    onDelete(mod.id);
  };

  const updateLesson = (updated: Lesson) => onUpdate({ ...mod, lessons: mod.lessons.map(l => l.id === updated.id ? updated : l) });
  const deleteLesson = (id: string) => onUpdate({ ...mod, lessons: mod.lessons.filter(l => l.id !== id) });
  const addLesson = (lesson: Lesson) => onUpdate({ ...mod, lessons: [...mod.lessons, lesson] });

  const videoCount = mod.lessons.filter(l => l.videoUrl).length;

  return (
    <div style={{ background: "#ffffff", borderRadius: 12, border: "1px solid rgba(10,21,53,0.08)", boxShadow: "0 1px 4px rgba(10,21,53,0.04)", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "14px 18px", borderBottom: open ? "1px solid rgba(10,21,53,0.06)" : "none", gap: 10 }}>
        <button onClick={() => setOpen(o => !o)} style={{ background: "none", border: "none", cursor: "pointer", color: "#0A1535", padding: 0, display: "flex" }}>
          {open ? <ChevronDown size={16} color="#C9A227" /> : <ChevronRight size={16} color="#C9A227" />}
        </button>

        {renaming ? (
          <div style={{ flex: 1, display: "flex", gap: 6, alignItems: "center" }}>
            <input
              autoFocus value={newTitle} onChange={e => setNewTitle(e.target.value)}
              style={{ ...inStyle, flex: 1 }}
              onFocus={e => (e.currentTarget.style.borderColor = "#C9A227")}
              onBlur={e => (e.currentTarget.style.borderColor = "#e5e5e5")}
            />
            <button onClick={saveRename} disabled={renaming_saving} className="btn-primary" style={{ padding: "5px 10px", fontSize: 12 }}>
              {renaming_saving ? <Loader2 size={12} style={{ animation: "rotateSeal 1s linear infinite" }} /> : <Check size={13} />}
            </button>
            <button onClick={() => { setRenaming(false); setNewTitle(mod.title); }} className="btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }}>
              <X size={13} />
            </button>
          </div>
        ) : (
          <span style={{ flex: 1, fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600, color: "#0A1535" }}>{mod.title}</span>
        )}

        <span style={{ fontSize: 12, color: "rgba(10,21,53,0.4)", fontFamily: "var(--font-body)", whiteSpace: "nowrap" }}>
          {mod.lessons.length} lessons · {videoCount} videos
        </span>

        {!renaming && (
          <>
            <button onClick={() => setRenaming(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(10,21,53,0.3)", padding: 4, borderRadius: 4, display: "flex" }} title="Rename module"
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "#0A1535")}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(10,21,53,0.3)")}
            ><Pencil size={13} /></button>
            <button onClick={deleteMod} disabled={deleting} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(10,21,53,0.25)", padding: 4, borderRadius: 4, display: "flex" }} title="Delete module"
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "#ef4444")}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(10,21,53,0.25)")}
            >
              {deleting ? <Loader2 size={13} style={{ animation: "rotateSeal 1s linear infinite" }} /> : <Trash2 size={13} />}
            </button>
          </>
        )}
      </div>

      {open && (
        <div style={{ padding: "0 18px 18px", display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
          {mod.lessons.length === 0 && (
            <p style={{ fontSize: 13, color: "rgba(10,21,53,0.35)", fontFamily: "var(--font-body)", padding: "4px 0" }}>No lessons yet.</p>
          )}
          {mod.lessons.map(lesson => (
            <LessonRow
              key={lesson.id} lesson={lesson} courseId={courseId} moduleId={mod.id}
              onUpdate={updateLesson} onDelete={deleteLesson}
            />
          ))}
          <AddLessonForm courseId={courseId} moduleId={mod.id} onAdded={addLesson} />
        </div>
      )}
    </div>
  );
}

// ── main component ─────────────────────────────────────────────────────────────

export default function AdminCourseContent({ course: initial }: { course: Course }) {
  const [modules, setModules] = useState<Module[]>(initial.modules);

  const updateModule = (updated: Module) => setModules(prev => prev.map(m => m.id === updated.id ? updated : m));
  const deleteModule = (id: string) => setModules(prev => prev.filter(m => m.id !== id));
  const addModule = (mod: Module) => setModules(prev => [...prev, mod]);

  const totalLessons = modules.reduce((s, m) => s + m.lessons.length, 0);
  const totalVideos  = modules.reduce((s, m) => s + m.lessons.filter(l => l.videoUrl).length, 0);

  return (
    <div>
      <div style={{ display: "flex", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
        {[{ label: "Modules", value: modules.length }, { label: "Lessons", value: totalLessons }, { label: "Videos", value: totalVideos }].map(s => (
          <div key={s.label} style={{ background: "#ffffff", border: "1px solid rgba(10,21,53,0.08)", borderRadius: 10, padding: "12px 20px", minWidth: 100, boxShadow: "0 1px 4px rgba(10,21,53,0.04)" }}>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, color: "#0A1535", margin: 0 }}>{s.value}</p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.4)", margin: 0 }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div style={{ background: "rgba(201,162,39,0.06)", border: "1px solid rgba(201,162,39,0.2)", borderRadius: 10, padding: "12px 16px", marginBottom: 24, display: "flex", gap: 10, alignItems: "flex-start" }}>
        <Video size={16} color="#C9A227" style={{ marginTop: 2, flexShrink: 0 }} />
        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#7a6010", margin: 0, lineHeight: 1.6 }}>
          Paste any video URL — YouTube, Vimeo, or direct MP4. Use "Edit content" to add Markdown lesson body text.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
        {modules.length === 0 && (
          <div style={{ background: "#ffffff", borderRadius: 12, border: "1px solid rgba(10,21,53,0.08)", padding: "32px", textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(10,21,53,0.45)" }}>No modules yet. Add your first module to get started.</p>
          </div>
        )}
        {modules.map(mod => (
          <ModuleAccordion key={mod.id} mod={mod} courseId={initial.id} onUpdate={updateModule} onDelete={deleteModule} />
        ))}
      </div>

      <AddModuleForm courseId={initial.id} onAdded={addModule} />
    </div>
  );
}
