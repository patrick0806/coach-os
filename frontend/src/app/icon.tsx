import { ImageResponse } from "next/og"

export const size = { width: 32, height: 32 }
export const contentType = "image/png"

// Coach OS brand color — oklch(0.67 0.16 58) ≈ warm orange
const BRAND = "#e07a2a"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: `linear-gradient(145deg, #e8882e 0%, ${BRAND} 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Dumbbell — left plate + collar + bar + collar + right plate */}
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* Left plate */}
          <div
            style={{
              width: 5,
              height: 18,
              background: "white",
              borderRadius: 2,
              opacity: 0.95,
            }}
          />
          {/* Left collar */}
          <div
            style={{
              width: 2,
              height: 11,
              background: "white",
              opacity: 0.85,
            }}
          />
          {/* Bar */}
          <div
            style={{
              width: 9,
              height: 4,
              background: "white",
              borderRadius: 1,
              opacity: 0.95,
            }}
          />
          {/* Right collar */}
          <div
            style={{
              width: 2,
              height: 11,
              background: "white",
              opacity: 0.85,
            }}
          />
          {/* Right plate */}
          <div
            style={{
              width: 5,
              height: 18,
              background: "white",
              borderRadius: 2,
              opacity: 0.95,
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  )
}
