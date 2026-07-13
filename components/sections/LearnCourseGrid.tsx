"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Clock, Users, ArrowRight } from "lucide-react";

type Course = {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  durationLabel: string;
  enrollCount: number;
};

const levelColor = (level: string) => {
  if (level === "Beginner") return { bg: "rgba(34,197,94,0.1)", text: "#22C55E", border: "rgba(34,197,94,0.2)" };
  if (level === "Intermediate") return { bg: "rgba(201,162,39,0.1)", text: "var(--gold-400)", border: "rgba(201,162,39,0.2)" };
  return { bg: "rgba(75,45,127,0.2)", text: "#9B73E8", border: "rgba(75,45,127,0.3)" };
};

const fin = (delay: number) => ({ initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay, duration: 0.6 } });

export default function LearnCourseGrid({ courses, locale }: { courses: Course[]; locale: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
      {courses.map((course, i) => {
        const lc = levelColor(course.level);
        return (
          <motion.div key={course.id} {...fin(i * 0.07)} style={{ background: "var(--bg-surface)", border: "1px solid rgba(27,42,123,0.08)", borderRadius: 16, overflow: "hidden", transition: "all 0.3s", cursor: "pointer" }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(201,162,39,0.25)"; el.style.transform = "translateY(-4px)"; el.style.boxShadow = "0 12px 40px rgba(201,162,39,0.08)"; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(27,42,123,0.08)"; el.style.transform = "translateY(0)"; el.style.boxShadow = "none"; }}
          >
            {/* Thumbnail */}
            <div style={{ height: 140, background: "linear-gradient(135deg, var(--bg-dark), var(--purple-600))", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BookOpen size={40} color="rgba(201,162,39,0.4)" />
              <div style={{ position: "absolute", top: 12, left: 12, padding: "4px 10px", background: "rgba(201,162,39,0.15)", border: "1px solid rgba(201,162,39,0.25)", borderRadius: 4, fontFamily: "var(--font-body)", fontSize: 10, color: "var(--gold-300)", fontWeight: 600, letterSpacing: "0.05em" }}>{course.category}</div>
            </div>
            <div style={{ padding: "20px 20px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ padding: "3px 10px", background: lc.bg, border: `1px solid ${lc.border}`, borderRadius: 4, fontFamily: "var(--font-body)", fontSize: 11, color: lc.text, fontWeight: 600 }}>{course.level}</span>
              </div>
              <h3 style={{ fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8, lineHeight: 1.4 }}>{course.title}</h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 16 }}>{course.description}</p>
              <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)" }}><Clock size={12} />{course.durationLabel}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)" }}><Users size={12} />{course.enrollCount} enrolled</span>
              </div>
              <Link href={`/${locale}/learn/${course.id}`} className="btn-primary" style={{ display: "flex", justifyContent: "center", fontSize: 13, padding: "10px 20px" }}>
                View Course <ArrowRight size={13} />
              </Link>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
