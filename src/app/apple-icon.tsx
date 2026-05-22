import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS doesn't apply rounded corners until iOS 16+; we render flat
// since iOS adds its own mask. Background fills to the edge so iOS
// can apply its standard squircle without showing white corners.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0D9488",
          color: "white",
          fontSize: 124,
          fontWeight: 800,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        F
      </div>
    ),
    size
  );
}
