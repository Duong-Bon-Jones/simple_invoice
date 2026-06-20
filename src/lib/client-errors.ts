export class SessionExpiredError extends Error {
  constructor() {
    super("Session expired");
  }
}
