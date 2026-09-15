import { ImageResponse } from "next/og";

export const alt = "قُدرة — اختبار قدرات كمي";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Latin-only layout — Satori (next/og) cannot shape Arabic GSUB
 * (lookupType 5 / substFormat 3), which broke Vercel prerender.
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background:
            "linear-gradient(135deg, #0F766E 0%, #115E59 42%, #0F172A 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 28,
            color: "#5EEAD4",
            fontWeight: 700,
            letterSpacing: 4,
          }}
        >
          QUDRAH
        </div>
        <div style={{ fontSize: 72, fontWeight: 800, marginTop: 20 }}>
          Quantitative Qudurat Exam
        </div>
        <div style={{ fontSize: 32, marginTop: 20, color: "#CCFBF1" }}>
          Full timed exam + skill training
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 40,
            fontSize: 26,
            color: "#99F6E4",
            gap: 24,
          }}
        >
          <span>60 skills</span>
          <span>·</span>
          <span>60 questions</span>
          <span>·</span>
          <span>60 minutes</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
