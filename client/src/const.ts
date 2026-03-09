export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/**
 * Local login URL - no OAuth, no external services
 * Redirects to /login page for local JWT authentication
 */
export const getLoginUrl = () => {
  return "/login";
};
