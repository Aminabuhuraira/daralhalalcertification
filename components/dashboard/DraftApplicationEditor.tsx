"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Send, ChevronDown, ChevronRight, Plus, Trash2, CheckSquare, Square } from "lucide-react";
import DocumentUpload from "@/components/dashboard/DocumentUpload";
import { SCHEME_CODES } from "@/lib/sectors";

const ENTITY_TYPES = ["Sole Proprietorship", "Partnership", "Private Limited Company (Pvt Ltd)", "Public Limited Company (Ltd)", "Non-Governmental Organisation (NGO)", "Co-operative Society", "Other"];
const SCALES = [
  { value: "LARGE",  label: "Large Scale",  desc: "High-volume industrial / national distribution" },
  { value: "MEDIUM", label: "Medium Scale", desc: "Regional distribution, mid-tier production" },
  { value: "SMALL",  label: "Small Scale",  desc: "Local or startup, limited production" },
];
const INGREDIENT_SOURCES  = ["Animal (Halal Slaughtered)", "Animal (Unknown/Uncertain)", "Plant", "Synthetic", "Microbial", "Processed"];
const INGREDIENT_STATUSES = ["Halal Certified", "Halal (No Cert)", "Non-Halal", "Uncertain", "Not Applicable"];

type Product    = { name: string; brand: string };
type Ingredient = { name: string; source: string; manufacturer: string; halalStatus: string; certBody: string; certExpiry: string; otherDoc: string };
type OtherCerts = { iso22000: boolean; iso22000Ref: string; haccp: boolean; haccpRef: string; gmp: boolean; gmpRef: string; iso9001: boolean; iso9001Ref: string; others: string };

type App = {
  id: string;
  businessName: string;
  sector: string | null;
  schemeCode: string | null;
  productionScale: string | null;
  productList: string;
  notes: string | null;
  documents: string | null;
  businessRegNo: string | null;
  entityType: string | null;
  headOfficeAddress: string | null;
  factoryAddress: string | null;
  telephone: string | null;
  website: string | null;
  picName: string | null;
  picDesignation: string | null;
  picPhone: string | null;
  picEmail: string | null;
  ingredientList: string | null;
  otherCertifications: string | null;
  declarationAccepted: boolean;
};

function parseProducts(raw: string): Product[] {
  try { const arr = JSON.parse(raw); if (Array.isArray(arr) && arr.length) return arr as Product[]; } catch {}
  return raw ? raw.split(/\n|,/).filter(Boolean).map(s => ({ name: s.trim(), brand: "" })) : [{ name: "", brand: "" }];
}
function parseIngredients(raw: string | null): Ingredient[] {
  try { if (raw) { const arr = JSON.parse(raw); if (Array.isArray(arr)) return arr as Ingredient[]; } } catch {}
  return [{ name: "", source: "Plant", manufacturer: "", halalStatus: "Halal Certified", certBody: "", certExpiry: "", otherDoc: "" }];
}
function parseOtherCerts(raw: string | null): OtherCerts {
  try { if (raw) return JSON.parse(raw) as OtherCerts; } catch {}
  return { iso22000: false, iso22000Ref: "", haccp: false, haccpRef: "", gmp: false, gmpRef: "", iso9001: false, iso9001Ref: "", others: "" };
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 13px",
  background: "rgba(10,21,53,0.02)", border: "1px solid rgba(10,21,53,0.12)",
  borderRadius: 7, fontFamily: "var(--font-body)", fontSize: 13.5, color: "#0A1535",
  outline: "none", boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700,
  color: "rgba(10,21,53,0.66)", textTransform: "uppercase", letterSpacing: "0.06em",
  display: "block", marginBottom: 5,
};
const sectionHeadStyle: React.CSSProperties = {
  fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700,
  color: "#C9A227", textTransform: "uppercase", letterSpacing: "0.07em",
  padding: "10px 16px", background: "rgba(201,162,39,0.06)",
  borderBottom: "1px solid rgba(201,162,39,0.15)",
};

function SectionBox({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid rgba(10,21,53,0.09)", borderRadius: 10, overflow: "hidden", marginBottom: 16 }}>
      <p style={sectionHeadStyle}>{label}</p>
      <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>
    </div>
  );
}

function Row2({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label style={labelStyle}>{label}</label>{children}</div>;
}

export default function DraftApplicationEditor({ app }: { app: App }) {
  const router = useRouter();

  // Section A
  const [businessName,      setBizName]      = useState(app.businessName);
  const [businessRegNo,     setRegNo]        = useState(app.businessRegNo ?? "");
  const [entityType,        setEntityType]   = useState(app.entityType ?? "");
  const [headOfficeAddress, setHeadAddr]     = useState(app.headOfficeAddress ?? "");
  const [factoryAddress,    setFactoryAddr]  = useState(app.factoryAddress ?? "");
  const [telephone,         setTelephone]    = useState(app.telephone ?? "");
  const [website,           setWebsite]      = useState(app.website ?? "");

  // Section B
  const [picName,        setPicName]        = useState(app.picName ?? "");
  const [picDesignation, setPicDesignation] = useState(app.picDesignation ?? "");
  const [picPhone,       setPicPhone]       = useState(app.picPhone ?? "");
  const [picEmail,       setPicEmail]       = useState(app.picEmail ?? "");

  // Section C
  const [schemeCode,     setSchemeCode]     = useState(app.schemeCode ?? "");

  // Section D
  const [productionScale, setScale]         = useState(app.productionScale ?? "");

  // Section E
  const [products,    setProducts]    = useState<Product[]>(() => parseProducts(app.productList));
  const [ingredients, setIngredients] = useState<Ingredient[]>(() => parseIngredients(app.ingredientList));

  // Section F
  const [otherCerts, setOtherCerts] = useState<OtherCerts>(() => parseOtherCerts(app.otherCertifications));

  // Section G
  const [notes, setNotes] = useState(app.notes ?? "");

  // Section I
  const [declarationAccepted, setDeclaration] = useState(app.declarationAccepted);

  // UI
  const [saving,     setSaving]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message,    setMessage]    = useState("");
  const [showIngr,   setShowIngr]   = useState(false);

  const selectedScheme = SCHEME_CODES.find(s => s.code === schemeCode);

  const buildPayload = () => ({
    businessName:        businessName.trim(),
    businessRegNo:       businessRegNo.trim() || undefined,
    entityType:          entityType || undefined,
    headOfficeAddress:   headOfficeAddress.trim() || undefined,
    factoryAddress:      factoryAddress.trim() || undefined,
    telephone:           telephone.trim() || undefined,
    website:             website.trim() || undefined,
    picName:             picName.trim() || undefined,
    picDesignation:      picDesignation.trim() || undefined,
    picPhone:            picPhone.trim() || undefined,
    picEmail:            picEmail.trim() || undefined,
    sector:              selectedScheme?.label ?? schemeCode,
    schemeCode:          schemeCode || undefined,
    productionScale:     productionScale || undefined,
    productList:         JSON.stringify(products.filter(p => p.name.trim())),
    ingredientList:      JSON.stringify(ingredients.filter(i => i.name.trim())),
    otherCertifications: JSON.stringify(otherCerts),
    notes:               notes.trim() || undefined,
    declarationAccepted,
  });

  const isValid = (
    businessName.trim() &&
    businessRegNo.trim() &&
    entityType &&
    headOfficeAddress.trim() &&
    telephone.trim() &&
    picName.trim() &&
    picDesignation.trim() &&
    picPhone.trim() &&
    schemeCode &&
    productionScale &&
    products.some(p => p.name.trim()) &&
    declarationAccepted
  );

  const saveDraft = async () => {
    setSaving(true); setMessage("");
    try {
      const res = await fetch(`/api/certification-applications/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      if (!res.ok) { setMessage("Could not save. Please try again."); return; }
      setMessage("Draft saved.");
      router.refresh();
    } catch { setMessage("Network error."); }
    finally { setSaving(false); }
  };

  const submitApplication = async () => {
    if (!isValid) return;
    setSubmitting(true); setMessage("");
    try {
      await fetch(`/api/certification-applications/${app.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const res = await fetch(`/api/certification-applications/${app.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submit" }),
      });
      if (!res.ok) { setMessage("Could not submit. Please try again."); setSubmitting(false); return; }
      router.refresh();
    } catch { setMessage("Network error."); setSubmitting(false); }
  };

  // Product helpers
  const addProduct = () => setProducts(prev => [...prev, { name: "", brand: "" }]);
  const removeProduct = (i: number) => setProducts(prev => prev.filter((_, idx) => idx !== i));
  const updateProduct = (i: number, f: keyof Product, v: string) =>
    setProducts(prev => prev.map((p, idx) => idx === i ? { ...p, [f]: v } : p));

  // Ingredient helpers
  const addIngredient = () => setIngredients(prev => [...prev, { name: "", source: "Plant", manufacturer: "", halalStatus: "Halal Certified", certBody: "", certExpiry: "", otherDoc: "" }]);
  const removeIngredient = (i: number) => setIngredients(prev => prev.filter((_, idx) => idx !== i));
  const updateIngredient = (i: number, f: keyof Ingredient, v: string) =>
    setIngredients(prev => prev.map((r, idx) => idx === i ? { ...r, [f]: v } : r));

  // OtherCerts helpers
  const toggleCert = (k: keyof OtherCerts) => setOtherCerts(prev => ({ ...prev, [k]: !prev[k] }));
  const updateCert = (k: keyof OtherCerts, v: string) => setOtherCerts(prev => ({ ...prev, [k]: v }));

  const selectStyle: React.CSSProperties = { ...inputStyle, cursor: "pointer" };
  const tblHead: React.CSSProperties = { padding: "8px 10px", textAlign: "left", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, color: "rgba(255,255,255,0.8)", textTransform: "uppercase", letterSpacing: "0.05em" };
  const tblCell: React.CSSProperties = { padding: "6px 8px", verticalAlign: "top" };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 8, background: "rgba(107,114,128,0.06)", border: "1px solid rgba(107,114,128,0.2)", marginBottom: 20 }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.72)" }}>
          Complete all sections of this form. Fields marked <strong>*</strong> are required before submission. You may save a draft at any time.
        </p>
      </div>

      {/* Section A: Company Information */}
      <SectionBox label="Section A — Company Information">
        <Row2>
          <Field label="Business / Brand Name *">
            <input value={businessName} onChange={e => setBizName(e.target.value)} style={inputStyle} placeholder="e.g. Halal Foods Nigeria Ltd" />
          </Field>
          <Field label="Business Registration No. *">
            <input value={businessRegNo} onChange={e => setRegNo(e.target.value)} style={inputStyle} placeholder="e.g. RC 1234567 / BN 0001234" />
          </Field>
        </Row2>
        <Field label="Type of Business Entity *">
          <select value={entityType} onChange={e => setEntityType(e.target.value)} style={selectStyle}>
            <option value="">— Select entity type —</option>
            {ENTITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Head Office Address *">
          <textarea rows={2} value={headOfficeAddress} onChange={e => setHeadAddr(e.target.value)} style={{ ...inputStyle, resize: "vertical" }} placeholder="Full registered office address" />
        </Field>
        <Field label="Factory / Production Premises Address (if different)">
          <textarea rows={2} value={factoryAddress} onChange={e => setFactoryAddr(e.target.value)} style={{ ...inputStyle, resize: "vertical" }} placeholder="Leave blank if same as head office" />
        </Field>
        <Row2>
          <Field label="Telephone *">
            <input value={telephone} onChange={e => setTelephone(e.target.value)} style={inputStyle} placeholder="+234 xxx xxx xxxx" />
          </Field>
          <Field label="Website (optional)">
            <input value={website} onChange={e => setWebsite(e.target.value)} style={inputStyle} placeholder="https://www.yourcompany.com" />
          </Field>
        </Row2>
      </SectionBox>

      {/* Section B: Person in Charge */}
      <SectionBox label="Section B — Person In Charge (PIC)">
        <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.68)", marginTop: -4 }}>
          The designated contact person responsible for this certification application.
        </p>
        <Row2>
          <Field label="Full Name *">
            <input value={picName} onChange={e => setPicName(e.target.value)} style={inputStyle} placeholder="Full name of PIC" />
          </Field>
          <Field label="Designation / Title *">
            <input value={picDesignation} onChange={e => setPicDesignation(e.target.value)} style={inputStyle} placeholder="e.g. Quality Manager, Director" />
          </Field>
        </Row2>
        <Row2>
          <Field label="Phone Number *">
            <input value={picPhone} onChange={e => setPicPhone(e.target.value)} style={inputStyle} placeholder="+234 xxx xxx xxxx" />
          </Field>
          <Field label="Email Address">
            <input type="email" value={picEmail} onChange={e => setPicEmail(e.target.value)} style={inputStyle} placeholder="pic@yourcompany.com" />
          </Field>
        </Row2>
      </SectionBox>

      {/* Section C: Certification Scheme */}
      <SectionBox label="Section C — Certification Scheme *">
        <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.68)", marginTop: -4 }}>
          Select the DAHC halal certification scheme that best describes your products or services.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
          {SCHEME_CODES.map(s => {
            const selected = schemeCode === s.code;
            return (
              <button key={s.code} type="button" onClick={() => setSchemeCode(s.code)} style={{
                padding: "12px 14px", borderRadius: 8, cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                border: selected ? "2px solid #C9A227" : "2px solid rgba(10,21,53,0.1)",
                background: selected ? "rgba(201,162,39,0.06)" : "white",
              }}>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: selected ? "#9a7810" : "#6D28D9", letterSpacing: "0.05em", display: "block", marginBottom: 2 }}>{s.code}</span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: selected ? "#0A1535" : "rgba(10,21,53,0.6)", lineHeight: 1.4, display: "block" }}>{s.label}</span>
              </button>
            );
          })}
        </div>
      </SectionBox>

      {/* Section D: Production Scale */}
      <SectionBox label="Section D — Production Scale *">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {SCALES.map(s => {
            const selected = productionScale === s.value;
            return (
              <button key={s.value} type="button" onClick={() => setScale(s.value)} style={{
                padding: "14px 12px", borderRadius: 10, cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                border: selected ? "2px solid #C9A227" : "2px solid rgba(10,21,53,0.1)",
                background: selected ? "rgba(201,162,39,0.06)" : "white",
              }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600, color: selected ? "#C9A227" : "#0A1535", marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 11.5, color: "rgba(10,21,53,0.66)", lineHeight: 1.4 }}>{s.desc}</div>
              </button>
            );
          })}
        </div>
      </SectionBox>

      {/* Section E: Products & Ingredients */}
      <SectionBox label="Section E — Products & Ingredient Information">
        {/* Product table */}
        <div>
          <label style={labelStyle}>Products / Services to be Certified *</label>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.66)", marginBottom: 10 }}>
            List each product or service category you wish to certify.
          </p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 400 }}>
              <thead>
                <tr style={{ background: "#0A1535" }}>
                  <th style={tblHead}>#</th>
                  <th style={tblHead}>Product / Service Name *</th>
                  <th style={tblHead}>Brand Name (if different)</th>
                  <th style={tblHead}></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(10,21,53,0.07)", background: i % 2 === 0 ? "white" : "#fafafa" }}>
                    <td style={{ ...tblCell, textAlign: "center", width: 36, fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.64)" }}>{i + 1}</td>
                    <td style={{ ...tblCell, minWidth: 220 }}>
                      <input value={p.name} onChange={e => updateProduct(i, "name", e.target.value)} style={{ ...inputStyle, fontSize: 13 }} placeholder="e.g. Jollof Spice Blend" />
                    </td>
                    <td style={{ ...tblCell, minWidth: 160 }}>
                      <input value={p.brand} onChange={e => updateProduct(i, "brand", e.target.value)} style={{ ...inputStyle, fontSize: 13 }} placeholder="e.g. SpiceMaster™" />
                    </td>
                    <td style={{ ...tblCell, width: 36 }}>
                      {products.length > 1 && (
                        <button onClick={() => removeProduct(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(239,68,68,0.5)", padding: 4 }}>
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={addProduct} style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 600, color: "#6D28D9", background: "none", border: "1px dashed rgba(109,40,217,0.3)", borderRadius: 6, padding: "7px 14px", cursor: "pointer" }}>
            <Plus size={13} /> Add Product
          </button>
        </div>

        {/* Ingredient table toggle */}
        <div style={{ marginTop: 4 }}>
          <button
            onClick={() => setShowIngr(v => !v)}
            style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 600, color: "#0A1535", background: "rgba(10,21,53,0.03)", border: "1px solid rgba(10,21,53,0.1)", borderRadius: 7, padding: "9px 14px", cursor: "pointer", width: "100%" }}
          >
            {showIngr ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            Ingredient / Raw Material List (recommended for food products)
          </button>
          {showIngr && (
            <div style={{ marginTop: 10 }}>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(10,21,53,0.66)", marginBottom: 10 }}>
                List all key raw materials and ingredients used in production. Include halal status documentation details.
              </p>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                  <thead>
                    <tr style={{ background: "#0A1535" }}>
                      {["#", "Ingredient Name", "Source", "Manufacturer/Supplier", "Halal Status", "Certifying Body", "Cert Expiry", "Supporting Doc", ""].map(h => (
                        <th key={h} style={tblHead}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ingredients.map((r, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(10,21,53,0.07)", background: i % 2 === 0 ? "white" : "#fafafa" }}>
                        <td style={{ ...tblCell, textAlign: "center", width: 30, fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(10,21,53,0.62)" }}>{i + 1}</td>
                        <td style={{ ...tblCell, minWidth: 140 }}><input value={r.name} onChange={e => updateIngredient(i, "name", e.target.value)} style={{ ...inputStyle, fontSize: 12 }} placeholder="e.g. Palm Oil" /></td>
                        <td style={{ ...tblCell, minWidth: 120 }}>
                          <select value={r.source} onChange={e => updateIngredient(i, "source", e.target.value)} style={{ ...inputStyle, fontSize: 12, cursor: "pointer" }}>
                            {INGREDIENT_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td style={{ ...tblCell, minWidth: 130 }}><input value={r.manufacturer} onChange={e => updateIngredient(i, "manufacturer", e.target.value)} style={{ ...inputStyle, fontSize: 12 }} placeholder="Supplier name" /></td>
                        <td style={{ ...tblCell, minWidth: 120 }}>
                          <select value={r.halalStatus} onChange={e => updateIngredient(i, "halalStatus", e.target.value)} style={{ ...inputStyle, fontSize: 12, cursor: "pointer" }}>
                            {INGREDIENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td style={{ ...tblCell, minWidth: 100 }}><input value={r.certBody} onChange={e => updateIngredient(i, "certBody", e.target.value)} style={{ ...inputStyle, fontSize: 12 }} placeholder="e.g. LPPOM MUI" /></td>
                        <td style={{ ...tblCell, minWidth: 120 }}><input type="date" value={r.certExpiry} onChange={e => updateIngredient(i, "certExpiry", e.target.value)} style={{ ...inputStyle, fontSize: 12 }} /></td>
                        <td style={{ ...tblCell, minWidth: 100 }}><input value={r.otherDoc} onChange={e => updateIngredient(i, "otherDoc", e.target.value)} style={{ ...inputStyle, fontSize: 12 }} placeholder="e.g. CoA, SDS" /></td>
                        <td style={{ ...tblCell, width: 30 }}>
                          {ingredients.length > 1 && (
                            <button onClick={() => removeIngredient(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(239,68,68,0.5)", padding: 2 }}>
                              <Trash2 size={12} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={addIngredient} style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 600, color: "#6D28D9", background: "none", border: "1px dashed rgba(109,40,217,0.3)", borderRadius: 6, padding: "7px 14px", cursor: "pointer" }}>
                <Plus size={13} /> Add Ingredient
              </button>
            </div>
          )}
        </div>
      </SectionBox>

      {/* Section F: Other Certifications */}
      <SectionBox label="Section F — Other Quality Certifications">
        <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.68)", marginTop: -4 }}>
          List any existing quality or food safety certifications held by your company.
        </p>
        {[
          { key: "iso22000" as const, ref: "iso22000Ref" as const, label: "ISO 22000:2018 — Food Safety Management System" },
          { key: "haccp"   as const, ref: "haccpRef"   as const, label: "HACCP — Hazard Analysis and Critical Control Points" },
          { key: "gmp"     as const, ref: "gmpRef"     as const, label: "GMP — Good Manufacturing Practice" },
          { key: "iso9001" as const, ref: "iso9001Ref" as const, label: "ISO 9001:2015 — Quality Management System" },
        ].map(({ key, ref, label }) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => toggleCert(key)} style={{ background: "none", border: "none", cursor: "pointer", flexShrink: 0, padding: 0, color: otherCerts[key] ? "#C9A227" : "rgba(10,21,53,0.3)" }}>
              {otherCerts[key] ? <CheckSquare size={18} color="#C9A227" /> : <Square size={18} color="rgba(10,21,53,0.3)" />}
            </button>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: otherCerts[key] ? "#0A1535" : "rgba(10,21,53,0.55)", flex: 1 }}>{label}</span>
            {otherCerts[key] && (
              <input
                value={otherCerts[ref] as string}
                onChange={e => updateCert(ref, e.target.value)}
                placeholder="Certificate number"
                style={{ ...inputStyle, width: "auto", maxWidth: 200, fontSize: 12.5 }}
              />
            )}
          </div>
        ))}
        <Field label="Other Certifications / Standards (specify)">
          <input value={otherCerts.others} onChange={e => updateCert("others", e.target.value)} style={inputStyle} placeholder="e.g. BRC, FSSC 22000, Organic, Kosher…" />
        </Field>
      </SectionBox>

      {/* Section G: Notes */}
      <SectionBox label="Section G — Additional Notes">
        <Field label="Additional Information for DAHC Review Team">
          <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} style={{ ...inputStyle, resize: "vertical" }} placeholder="Any additional context, special circumstances, or specific concerns relevant to your application (optional)" />
        </Field>
      </SectionBox>

      {/* Section H: Documents */}
      <SectionBox label="Section H — Supporting Documents">
        <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.68)", marginTop: -4 }}>
          Upload all required documentation. Refer to the DAHC Halal Certification Manual for the full document checklist (Sections A–I).
        </p>
        <DocumentUpload
          appId={app.id}
          initialDocs={app.documents ? (() => { try { return JSON.parse(app.documents!); } catch { return []; } })() : []}
          label="Upload Supporting Documents (CAC cert, ingredient certs, NAFDAC registration, factory layout, etc.)"
        />
      </SectionBox>

      {/* Section I: Declaration */}
      <SectionBox label="Section I — Applicant Declaration">
        <div style={{ padding: "14px 16px", borderRadius: 8, background: "rgba(10,21,53,0.02)", border: "1px solid rgba(10,21,53,0.08)" }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.78)", lineHeight: 1.7, marginBottom: 14 }}>
            I, the undersigned, hereby declare on behalf of the above-mentioned company that:
          </p>
          <ul style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(10,21,53,0.75)", lineHeight: 1.75, paddingLeft: 20, marginBottom: 16 }}>
            <li>All information provided in this application and supporting documents is accurate, complete, and truthful to the best of my knowledge;</li>
            <li>The company agrees to comply fully with all DAHC halal certification requirements and standards;</li>
            <li>The company consents to DAHC conducting on-site audits and inspections as required;</li>
            <li>The company will notify DAHC immediately of any material change to its products, processes, ingredients, or facilities;</li>
            <li>The company agrees to the DAHC Certification Agreement and Policy on Impartiality.</li>
          </ul>
          <button
            onClick={() => setDeclaration(v => !v)}
            style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}
          >
            {declarationAccepted
              ? <CheckSquare size={20} color="#C9A227" style={{ flexShrink: 0, marginTop: 1 }} />
              : <Square size={20} color="rgba(10,21,53,0.3)" style={{ flexShrink: 0, marginTop: 1 }} />
            }
            <span style={{ fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: declarationAccepted ? 700 : 400, color: declarationAccepted ? "#0A1535" : "rgba(10,21,53,0.6)", lineHeight: 1.5 }}>
              I confirm the above declaration and authorise this application to be submitted to Dar Al Halal Certification for processing. *
            </span>
          </button>
        </div>
      </SectionBox>

      {/* Status messages */}
      {message && (
        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: message === "Draft saved." ? "#16A34A" : "#DC2626", marginBottom: 12 }}>{message}</p>
      )}

      {/* Validation hint */}
      {!isValid && (
        <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(10,21,53,0.03)", border: "1px solid rgba(10,21,53,0.08)", marginBottom: 14 }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "rgba(10,21,53,0.7)" }}>
            To submit: complete all <strong>*</strong> fields in Sections A–E, at least one product, and tick the declaration.
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          onClick={saveDraft}
          disabled={saving || submitting}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600,
            padding: "11px 18px", borderRadius: 8, cursor: "pointer",
            background: "transparent", border: "1.5px solid rgba(10,21,53,0.2)",
            color: "rgba(10,21,53,0.75)", opacity: saving ? 0.6 : 1, transition: "all 0.15s",
          }}
        >
          <Save size={13} /> {saving ? "Saving…" : "Save Draft"}
        </button>
        <button
          onClick={submitApplication}
          disabled={!isValid || submitting || saving}
          className="btn-primary"
          style={{
            display: "flex", alignItems: "center", gap: 7,
            opacity: (!isValid || submitting) ? 0.55 : 1,
            cursor: !isValid || submitting ? "not-allowed" : "pointer",
          }}
        >
          <Send size={13} /> {submitting ? "Submitting…" : "Submit Application"}
        </button>
      </div>
    </div>
  );
}
