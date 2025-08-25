// src/utils/instagram.js
export function toInstagramEmbed(input, kind = "reel") {
  if (!input) return null;

  const s = String(input).trim();

  // If full URL given, normalize and add /embed
  if (s.startsWith("http")) {
    const withSlash = s.replace(/\/?$/, "/");
    return withSlash + "embed";
  }

  // Otherwise assume it's a shortcode
  // kind can be "reel" or "p" (post)
  return `https://www.instagram.com/${kind}/${s}/embed`;
}
