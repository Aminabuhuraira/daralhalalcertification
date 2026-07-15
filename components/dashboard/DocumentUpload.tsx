"use client";
import { useState, useRef } from "react";
import { Upload, FileText, Trash2, Download, X, CheckCircle2, Loader2 } from "lucide-react";

type DocEntry = {
  name: string;
  fileName: string;
  size: number;
  uploadedAt: string;
};

type Props = {
  appId: string;
  initialDocs: DocEntry[];
  readOnly?: boolean;
  label?: string;
};

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const FILE_EXTS = ".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp";

export default function DocumentUpload({ appId, initialDocs, readOnly = false, label }: Props) {
  const [docs,      setDocs]      = useState<DocEntry[]>(initialDocs);
  const [uploading, setUploading] = useState(false);
  const [deleting,  setDeleting]  = useState<string | null>(null);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(""); setSuccess("");

    for (const file of Array.from(files)) {
      const form = new FormData();
      form.append("appId", appId);
      form.append("file", file);

      const res = await fetch("/api/uploads", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed.");
        break;
      }
      setDocs(prev => [...prev, {
        name: data.name,
        fileName: data.fileName,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      }]);
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
    setSuccess("Uploaded successfully.");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleDelete = async (fileName: string) => {
    setDeleting(fileName); setError("");
    const res = await fetch(`/api/uploads/${encodeURIComponent(fileName)}`, { method: "DELETE" });
    setDeleting(null);
    if (res.ok) {
      setDocs(prev => prev.filter(d => d.fileName !== fileName));
    } else {
      setError("Could not remove file.");
    }
  };

  const [dragOver, setDragOver] = useState(false);

  return (
    <div>
      {label && (
        <p style={{
          fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700,
          color: "rgba(10,21,53,0.4)", textTransform: "uppercase",
          letterSpacing: "0.06em", marginBottom: 8,
        }}>
          {label}
        </p>
      )}

      {/* Upload zone */}
      {!readOnly && (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? "#C9A227" : "rgba(10,21,53,0.15)"}`,
            borderRadius: 10,
            padding: "18px 16px",
            textAlign: "center",
            cursor: "pointer",
            background: dragOver ? "rgba(201,162,39,0.04)" : "rgba(10,21,53,0.02)",
            transition: "all 0.15s",
            marginBottom: 10,
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept={FILE_EXTS}
            multiple
            style={{ display: "none" }}
            onChange={e => handleFiles(e.target.files)}
          />
          {uploading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Loader2 size={15} color="#C9A227" style={{ animation: "spin 1s linear infinite" }} />
              <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.55)" }}>
                Uploading…
              </span>
            </div>
          ) : (
            <>
              <Upload size={18} color="#C9A227" style={{ margin: "0 auto 8px" }} />
              <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.6)", margin: 0 }}>
                Drag files here or <span style={{ color: "#C9A227", fontWeight: 600 }}>click to browse</span>
              </p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(10,21,53,0.35)", marginTop: 4 }}>
                PDF, Word, JPG, PNG — max 10 MB each
              </p>
            </>
          )}
        </div>
      )}

      {/* Status messages */}
      {error && (
        <div style={{
          display: "flex", alignItems: "center", gap: 6, padding: "8px 12px",
          borderRadius: 7, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.25)",
          marginBottom: 8,
        }}>
          <X size={13} color="#ef4444" />
          <span style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "#ef4444" }}>{error}</span>
        </div>
      )}
      {success && (
        <div style={{
          display: "flex", alignItems: "center", gap: 6, padding: "8px 12px",
          borderRadius: 7, background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.25)",
          marginBottom: 8,
        }}>
          <CheckCircle2 size={13} color="#22c55e" />
          <span style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "#22c55e" }}>{success}</span>
        </div>
      )}

      {/* File list */}
      {docs.length === 0 ? (
        <p style={{
          fontFamily: "var(--font-body)", fontSize: 12.5,
          color: "rgba(10,21,53,0.35)", fontStyle: "italic",
        }}>
          No documents uploaded yet.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {docs.map((doc) => (
            <div
              key={doc.fileName}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 8,
                background: "#fafafa", border: "1px solid rgba(10,21,53,0.09)",
              }}
            >
              <FileText size={14} color="#6D28D9" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600,
                  color: "#0A1535", margin: 0,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {doc.name}
                </p>
                <p style={{
                  fontFamily: "var(--font-body)", fontSize: 11,
                  color: "rgba(10,21,53,0.4)", margin: 0,
                }}>
                  {fmtSize(doc.size)} · {new Date(doc.uploadedAt).toLocaleDateString()}
                </p>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <a
                  href={`/api/uploads/${encodeURIComponent(doc.fileName)}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "flex", alignItems: "center", gap: 4, padding: "4px 9px",
                    borderRadius: 5, background: "rgba(109,40,217,0.07)",
                    border: "1px solid rgba(109,40,217,0.2)", textDecoration: "none",
                    fontFamily: "var(--font-body)", fontSize: 11.5, fontWeight: 600, color: "#6D28D9",
                  }}
                >
                  <Download size={11} /> View
                </a>
                {!readOnly && (
                  <button
                    onClick={() => handleDelete(doc.fileName)}
                    disabled={deleting === doc.fileName}
                    style={{
                      display: "flex", alignItems: "center", padding: "4px 8px",
                      borderRadius: 5, background: "rgba(239,68,68,0.06)",
                      border: "1px solid rgba(239,68,68,0.2)", cursor: "pointer",
                      color: "#ef4444", opacity: deleting === doc.fileName ? 0.5 : 1,
                    }}
                  >
                    <Trash2 size={11} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
