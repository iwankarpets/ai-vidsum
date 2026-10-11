export const REFRESH_COOKIE = 'refresh_token';

const REFRESH_TTL_DAYS = Number(process.env.REFRESH_TOKEN_TTL_DAYS) || 30;
export const REFRESH_TTL_MS = REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000;

const baseCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/api/v1/auth',
};

export const refreshCookieOptions = { ...baseCookieOptions, maxAge: REFRESH_TTL_MS };
export const clearCookieOptions = baseCookieOptions;
