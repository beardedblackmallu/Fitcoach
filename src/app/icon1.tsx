import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#1C1C1C",
          color: "white",
          fontSize: 132,
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
