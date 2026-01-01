import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Utility: remove HTML tags
function stripHtml(input: string) {
  return input.replace(/<[^>]*>/g, "");
}

// Utility: remove emoji / unsupported astral symbols and control characters
// Keeps letters, numbers, hyphen, underscore and basic punctuation (.,:;?!()[]{}@&%$+-=/)
function removeEmojiAndUnsafeChars(str: string) {
  // Remove surrogate pairs (emojis and many pictographs) and other symbols that can break layout
  // Also remove control characters except newline/space
  return str
    .replace(/[\p{Cs}]/gu, "") // remove surrogate codepoints (emojis, many symbols)
    .replace(/[^\p{L}\p{N}_\-\s.,:;?!()[\]{}@&%$+=/]/gu, "");
}

// Utility: clamp and add ellipsis if trimmed
function clampText(input: string, maxLen: number) {
  if (input.length <= maxLen) return input;
  return input.slice(0, maxLen - 1).trimEnd() + "…";
}

export async function GET(request: NextRequest) {
  // defaults
  let title = "SpyberPolymath | Aman Anil";
  let description = "Cybersecurity Researcher & Ethical Hacker";
  let type = "website";
  let tagsRaw = "";
  let tags: string[] = [];

  try {
    const { searchParams } = new URL(request.url);

    title = searchParams.get("title") || title;
    description = searchParams.get("description") || description;
    type = searchParams.get("type") || type;
    tagsRaw = searchParams.get("tags") || "";

    // sanitize basic HTML
    title = stripHtml(String(title));
    description = stripHtml(String(description));

    // remove emoji / unsafe symbols which commonly break OG generators
    title = removeEmojiAndUnsafeChars(title);
    description = removeEmojiAndUnsafeChars(description);

    // final clamps (protect satori / layout)
    const SAFE_TITLE_LEN = 120;
    const SAFE_DESC_LEN = 280;
    title = clampText(title, SAFE_TITLE_LEN);
    description = clampText(description, SAFE_DESC_LEN);

    // allowed types
    const allowedTypes = ["website", "project", "article"];
    if (!allowedTypes.includes(type)) type = "website";

    // tags: allow unicode letters and numbers, hyphen, underscore and spaces inside tag
    try {
      tags = tagsRaw
        .split(",")
        .map((t) =>
          t
            .trim()
            // remove unsafe characters but keep letters/numbers/hyphen/underscore/space
            .replace(/[^\p{L}\p{N}_\-\s]/gu, "")
        )
        .filter(Boolean)
        .slice(0, 6); // limit to 6 tags for stability
    } catch {
      tags = [];
    }

    // colors
    const primaryColor = "#64ffda";
    const secondaryColor = "#ff6b6b";
    const textColor = "#ffffff";
    const subtextColor = "#a0aec0";

    // Prepare visually-safe short strings for rendering lines (ensures no unexpected overflow)
    const renderTitle = title; // already clamped
    const renderDescription = description; // already clamped

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            background:
              "linear-gradient(135deg, #0f1419 0%, #1a2332 35%, #2d3748 100%)",
            fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Soft background glow (kept simple for runtime stability) */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.06,
              background: primaryColor,
              filter: "blur(100px)",
            }}
          />

          {/* Content wrapper */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              padding: "80px 60px",
              position: "relative",
              boxSizing: "border-box",
            }}
          >
            {/* Brand */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "40px",
              }}
            >
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  background: primaryColor,
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "20px",
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#0f1419",
                  boxSizing: "border-box",
                }}
              >
                SP
              </div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: textColor,
                  whiteSpace: "nowrap",
                }}
              >
                SpyberPolymath
              </div>
            </div>

            {/* Title */}
            <div
              style={{
                fontSize: renderTitle.length > 50 ? "42px" : "56px",
                fontWeight: 800,
                color: textColor,
                textAlign: "center",
                lineHeight: 1.08,
                marginBottom: "24px",
                maxWidth: "900px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 3, // limited lines (satori respects this style)
                WebkitBoxOrient: "vertical",
                wordBreak: "break-word",
                boxSizing: "border-box",
                padding: 0,
              }}
            >
              {renderTitle}
            </div>

            {/* Description */}
            <div
              style={{
                fontSize: "24px",
                color: subtextColor,
                textAlign: "center",
                lineHeight: 1.28,
                marginBottom: "32px",
                maxWidth: "800px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 4,
                WebkitBoxOrient: "vertical",
                wordBreak: "break-word",
                boxSizing: "border-box",
                padding: 0,
              }}
            >
              {renderDescription}
            </div>

            {/* Tags */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                justifyContent: "center",
                maxWidth: "800px",
                boxSizing: "border-box",
              }}
            >
              {tags.slice(0, 6).map((tag, index) => (
                <div
                  key={index}
                  style={{
                    background: "rgba(100, 255, 218, 0.15)",
                    border: `1px solid ${primaryColor}`,
                    borderRadius: "16px",
                    padding: "8px 16px",
                    fontSize: "16px",
                    color: primaryColor,
                    maxWidth: "220px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  #{tag}
                </div>
              ))}
            </div>
          </div>

          {/* Type badge */}
          <div
            style={{
              position: "absolute",
              top: "40px",
              right: "40px",
              background: type === "project" ? secondaryColor : primaryColor,
              borderRadius: "20px",
              padding: "12px 20px",
              fontSize: "16px",
              fontWeight: 700,
              color: "#0f1419",
              textTransform: "uppercase",
              boxSizing: "border-box",
            }}
          >
            {type}
          </div>

          {/* Bottom decoration */}
          <div
            style={{
              position: "absolute",
              bottom: "40px",
              left: "60px",
              right: "60px",
              height: "2px",
              background: `linear-gradient(90deg, transparent 0%, ${primaryColor} 50%, transparent 100%)`,
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch (e: unknown) {
    // Log full context for easier debugging
    console.error("OG Image generation failed:", e, {
      url: request.url,
      title,
      description,
      type,
      tagsRaw,
      tags,
    });

    // Fallback response (always returns something to avoid socket hang up)
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0f1419",
            color: "#ffffff",
            fontSize: "48px",
            fontWeight: 800,
            fontFamily:
              "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
          }}
        >
          SpyberPolymath
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}
