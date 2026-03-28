/**
 * Canonical public origin for this API (no trailing slash).
 * Override on Render with SERVER_URL or BASE_URL if the hostname changes.
 */
function publicApiOrigin() {
  const raw = (
    process.env.SERVER_URL ||
    process.env.BASE_URL ||
    process.env.API_PUBLIC_URL ||
    ""
  )
    .trim()
    .replace(/\/$/, "");
  return raw || "https://gezana-api-m8u7.onrender.com";
}

module.exports = { publicApiOrigin };
