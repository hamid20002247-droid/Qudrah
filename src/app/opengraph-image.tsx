import { ImageResponse } from "next/og";

export const alt = "قُدرة — تدريب القسم الكمي في القدرات";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
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
        }}
      >
        <div
          style={{
            fontSize: 28,
            color: "#5EEAD4",
            fontWeight: 700,
            letterSpacing: 2,
          }}
        >
          QUDRAH
        </div>
        <div style={{ fontSize: 84, fontWeight: 800, marginTop: 16 }}>
          قُدرة
        </div>
        <div style={{ fontSize: 34, marginTop: 18, color: "#CCFBF1" }}>
          تدريب القسم الكمي في القدرات
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 36,
            fontSize: 24,
            color: "#99F6E4",
            gap: 24,
          }}
        >
          <span>60 مهارة</span>
          <span>·</span>
          <span>60 سؤال</span>
          <span>·</span>
          <span>60 دقيقة</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
