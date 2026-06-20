import "@testing-library/jest-dom/vitest";

process.env.IDENTITY_BASE_URL ??= "https://identity.example.com";
process.env.OAUTH_CLIENT_ID ??= "test-client-id";
process.env.OAUTH_CLIENT_SECRET ??= "test-client-secret";
process.env.API_BASE_URL ??= "https://api.example.com";

// jsdom doesn't implement these, but Radix UI (Select, etc.) calls them.
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {};
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
