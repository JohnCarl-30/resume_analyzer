import { ImageResponse } from "next/og";

export const alt = "Resumae resume builder and job match checker";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "stretch",
          background: "#ffffff",
          color: "#0f172a",
          display: "flex",
          height: "100%",
          padding: "56px",
          width: "100%",
        }}
      >
        <div
          style={{
            border: "1px solid #dfe6f0",
            display: "flex",
            flex: 1,
            padding: "54px",
          }}
        >
          <div
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ color: "#155dfc", display: "flex", fontSize: 28, fontWeight: 700 }}>
              Resumae
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "760px" }}>
              <div style={{ fontSize: 68, fontWeight: 700, letterSpacing: "-3px", lineHeight: 1.04 }}>
                Build a resume people and scanners can read.
              </div>
              <div style={{ color: "#5f6f87", fontSize: 30, lineHeight: 1.35 }}>
                Create, compare, and improve your resume with clear job-match guidance.
              </div>
            </div>

            <div style={{ color: "#5f6f87", display: "flex", fontSize: 22 }}>
              Resume builder · Job match checker
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
