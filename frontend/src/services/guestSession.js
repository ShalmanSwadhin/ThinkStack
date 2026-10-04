import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

const STORAGE_KEY = 'thinkstack-guest-key';
const COOKIE_NAME = 'thinkstack_guest_key';
// Browsers cap cookie lifetime at ~400 days; the cookie is rewritten on every visit to renew it.
const COOKIE_MAX_AGE_SECONDS = 400 * 24 * 60 * 60;
const KEY_PATTERN = /^[0-9a-f]{64}$/;

const NO_AUTO_GUEST_KEY = 'thinkstack-no-auto-guest';

const isValidKey = (value) => typeof value === 'string' && KEY_PATTERN.test(value);

// After an explicit logout, protected pages must not silently turn the visitor back into a
// guest for the rest of that tab's session. Any new session (login, register, "Continue as
// Guest") lifts the suppression.
export function suppressAutoGuest() {
  try {
    window.sessionStorage.setItem(NO_AUTO_GUEST_KEY, '1');
  } catch {
    // Without sessionStorage the worst case is an automatic guest after logout.
  }
}

export function allowAutoGuest() {
  try {
    window.sessionStorage.removeItem(NO_AUTO_GUEST_KEY);
  } catch {
    // ignore
  }
}

export function isAutoGuestSuppressed() {
  try {
    return window.sessionStorage.getItem(NO_AUTO_GUEST_KEY) === '1';
  } catch {
    return false;
  }
}

function readLocal() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeLocal(key) {
  try {
    window.localStorage.setItem(STORAGE_KEY, key);
  } catch {
    // Storage blocked or full — the cookie copy still covers us.
  }
}

function readCookie() {
  try {
    const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function writeCookie(key) {
  try {
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${COOKIE_NAME}=${key}; max-age=${COOKIE_MAX_AGE_SECONDS}; path=/; SameSite=Lax${secure}`;
  } catch {
    // Cookies disabled — localStorage copy still covers us.
  }
}

// Asks the browser to exempt this site's storage from automatic eviction under disk pressure.
function requestPersistentStorage() {
  try {
    navigator.storage?.persist?.().catch(() => {});
  } catch {
    // Unsupported — the key is still stored, just without the eviction guarantee.
  }
}

// The key lives in two independent places (localStorage and a long-lived cookie) so clearing
// one of them does not lose the guest. Whichever survives repairs the other.
export function getGuestKey() {
  const key = [readLocal(), readCookie()].find(isValidKey) ?? null;
  if (key) {
    writeLocal(key);
    writeCookie(key);
  }
  return key;
}

export function saveGuestKey(key) {
  writeLocal(key);
  writeCookie(key);
  requestPersistentStorage();
}

export function clearGuestKey() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  try {
    document.cookie = `${COOKIE_NAME}=; max-age=0; path=/; SameSite=Lax`;
  } catch {
    // ignore
  }
}

// Uses bare axios (not the app client) so it can run from inside the 401 interceptor.
export async function resumeGuestSession() {
  const guestKey = getGuestKey();
  if (!guestKey) return null;

  try {
    const { data } = await axios.post(
      `${API_URL}/auth/guest/resume`,
      { guestKey },
      { withCredentials: true }
    );
    return data.data;
  } catch (error) {
    // 401 means the key is dead (account upgraded or removed); anything else is transient.
    if (error.response?.status === 401) clearGuestKey();
    return null;
  }
}

export async function createGuestSession() {
  const { data } = await axios.post(`${API_URL}/auth/guest`, {}, { withCredentials: true });
  const { guestKey, ...session } = data.data;
  saveGuestKey(guestKey);
  return session;
}
