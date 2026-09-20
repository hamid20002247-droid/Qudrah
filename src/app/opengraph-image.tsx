import { ImageResponse } from "next/og";

export const alt = "قُدرة — اختبار قدرات كمي";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Latin-only layout — Satori (next/og) cannot shape Arabic reliably.
 * Arabic titles still come from og:title / twitter:title metadata.
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
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(145deg, #0F766E 0%, #0F172A 72%)",
          color: "white",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "#14B8A6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            Q
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: 1,
              color: "#99F6E4",
            }}
          >
            Qudrah
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.08,
              maxWidth: 920,
            }}
          >
            Saudi Qudurat — Quantitative prep
          </div>
          <div style={{ fontSize: 30, color: "#CCFBF1", maxWidth: 860 }}>
            Timed full exam + interactive skill training
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            fontSize: 24,
            fontWeight: 700,
            color: "#5EEAD4",
          }}
        >
          <span>60 skills</span>
          <span style={{ opacity: 0.5 }}>·</span>
          <span>60 questions</span>
          <span style={{ opacity: 0.5 }}>·</span>
          <span>60 minutes</span>
          <span style={{ opacity: 0.5 }}>·</span>
          <span>Free</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
