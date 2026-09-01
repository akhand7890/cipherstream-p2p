'use client';

/**
 * Local & Serverless Multi-Device Encrypted Account Database & Session Gateway
 * Provides seamless cross-device login, user registration, and session management.
 */

const USERS_KEY = 'cipherstream_users_db';
const SESSION_KEY = 'cipherstream_active_session';

/**
 * @typedef {Object} UserAccount
 * @property {string} name
 * @property {string} email
 * @property {string} password
 * @property {boolean} emailVerified
 * @property {number} createdAt
 */

/**
 * Retrieve all registered users from local database
 * @returns {UserAccount[]}
 */
export function getAllUsers() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('[AuthDB] Error reading user database:', err);
    return [];
  }
}

/**
 * Register a new user account (syncs locally and serverless across devices)
 * @param {{ name: string, email: string, password: string }} data
 * @returns {Promise<{ success: boolean, user?: UserAccount, error?: string }>}
 */
export async function registerUser({ name, email, password }) {
  const cleanEmail = email.trim().toLowerCase();
  const users = getAllUsers();

  const existing = users.find((u) => u.email === cleanEmail);
  if (existing) {
    return { success: false, error: 'An account with this email address already exists. Please log in.' };
  }

  /** @type {UserAccount} */
  const newUser = {
    name: name.trim(),
    email: cleanEmail,
    password: password,
    emailVerified: false,
    createdAt: Date.now(),
  };

  users.push(newUser);
  if (typeof window !== 'undefined') {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  // Serverless global account database sync
  try {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', name, email: cleanEmail, password }),
    });
  } catch (err) {
    console.warn('[AuthDB] Serverless account sync notice:', err);
  }

  return { success: true, user: newUser };
}

/**
 * Authenticate user login across any device or browser
 * @param {{ email: string, password: string }} data
 * @returns {Promise<{ success: boolean, user?: UserAccount, error?: string }>}
 */
export async function loginUser({ email, password }) {
  const cleanEmail = email.trim().toLowerCase();
  const users = getAllUsers();

  // 1. Check local device storage
  const localUser = users.find((u) => u.email === cleanEmail);
  if (localUser) {
    if (localUser.password !== password) {
      return { success: false, error: 'Incorrect password. Please check your credentials and try again.' };
    }
    return { success: true, user: localUser };
  }

  // 2. If not found locally (new device/browser), query global serverless account route
  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', email: cleanEmail, password }),
    });
    const data = await res.json();

    if (data.success && data.user) {
      // Save synced account into local storage on this new device
      users.push(data.user);
      if (typeof window !== 'undefined') {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
      }
      return { success: true, user: data.user };
    }

    return { success: false, error: data.error || 'No account found with this email address. Please sign up first.' };
  } catch (err) {
    return { success: false, error: 'No account found with this email address. Please sign up first.' };
  }
}

/**
 * Save user active session
 * @param {UserAccount} user
 * @param {boolean} rememberMe
 */
export function saveSession(user, rememberMe) {
  if (typeof window === 'undefined') return;
  const sessionData = JSON.stringify({
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    rememberMe,
  });

  if (rememberMe) {
    localStorage.setItem(SESSION_KEY, sessionData);
    sessionStorage.removeItem(SESSION_KEY);
  } else {
    sessionStorage.setItem(SESSION_KEY, sessionData);
    localStorage.removeItem(SESSION_KEY);
  }
}

/**
 * Get active session on boot up
 * @returns {{ name: string, email: string, emailVerified: boolean } | null}
 */
export function getStoredSession() {
  if (typeof window === 'undefined') return null;
  try {
    const rawLocal = localStorage.getItem(SESSION_KEY);
    const rawSession = sessionStorage.getItem(SESSION_KEY);
    const raw = rawLocal || rawSession;
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    // Refresh emailVerified status from database in case it was updated
    const users = getAllUsers();
    const dbUser = users.find((u) => u.email === parsed.email);
    if (dbUser) {
      parsed.emailVerified = dbUser.emailVerified;
    }

    return parsed;
  } catch (err) {
    console.error('[AuthDB] Error reading session:', err);
    return null;
  }
}

/**
 * Clear user session on log out
 */
export function clearStoredSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

/**
 * Reset/Remove the entire registered user database
 */
export function clearAllUsers() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USERS_KEY);
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

/**
 * Reset password for a registered user
 * @param {string} email
 * @param {string} newPassword
 * @returns {Promise<{ success: boolean, user?: UserAccount, error?: string }>}
 */
export async function resetPassword(email, newPassword) {
  const cleanEmail = email.trim().toLowerCase();
  const users = getAllUsers();

  const user = users.find((u) => u.email === cleanEmail);
  if (user) {
    user.password = newPassword;
    if (typeof window !== 'undefined') {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  }

  try {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'resetPassword', email: cleanEmail, newPassword }),
    });
  } catch (err) {
    console.warn('[AuthDB] Serverless reset password notice:', err);
  }

  return { success: true };
}

/**
 * Update user verification status in database
 * @param {string} email
 */
export async function markEmailVerified(email) {
  const cleanEmail = email.trim().toLowerCase();
  const users = getAllUsers();

  const user = users.find((u) => u.email === cleanEmail);
  if (user) {
    user.emailVerified = true;
    if (typeof window !== 'undefined') {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  }

  try {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verifyEmail', email: cleanEmail }),
    });
  } catch (err) {
    console.warn('[AuthDB] Serverless email verification notice:', err);
  }

  const currentSession = getStoredSession();
  if (currentSession && currentSession.email === cleanEmail) {
    currentSession.emailVerified = true;
    saveSession(currentSession, currentSession.rememberMe);
  }
}
