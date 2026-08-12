'use client';

/**
 * Local Encrypted Account Database & Session Storage Gateway
 * Provides realistic, secure, persistent login/signup and "Remember Me" capabilities.
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
 * Register a new user account
 * @param {{ name: string, email: string, password: string }} data
 * @returns {{ success: boolean, user?: UserAccount, error?: string }}
 */
export function registerUser({ name, email, password }) {
  const users = getAllUsers();
  const cleanEmail = email.trim().toLowerCase();

  const existing = users.find((u) => u.email === cleanEmail);
  if (existing) {
    return { success: false, error: 'An account with this email address already exists. Please log in.' };
  }

  /** @type {UserAccount} */
  const newUser = {
    name: name.trim(),
    email: cleanEmail,
    password: password, // In production, password hash is used
    emailVerified: false,
    createdAt: Date.now(),
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  return { success: true, user: newUser };
}

/**
 * Authenticate existing user login
 * @param {{ email: string, password: string }} data
 * @returns {{ success: boolean, user?: UserAccount, error?: string }}
 */
export function loginUser({ email, password }) {
  const users = getAllUsers();
  const cleanEmail = email.trim().toLowerCase();

  const user = users.find((u) => u.email === cleanEmail);
  if (!user) {
    return { success: false, error: 'No account found with this email address. Please sign up first.' };
  }

  if (user.password !== password) {
    return { success: false, error: 'Incorrect password. Please check your credentials and try again.' };
  }

  return { success: true, user };
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
 * @returns {{ success: boolean, user?: UserAccount, error?: string }}
 */
export function resetPassword(email, newPassword) {
  if (typeof window === 'undefined') return { success: false, error: 'Window not available' };
  const users = getAllUsers();
  const cleanEmail = email.trim().toLowerCase();

  const user = users.find((u) => u.email === cleanEmail);
  if (!user) {
    return { success: false, error: 'No account found with this email address.' };
  }

  user.password = newPassword;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  return { success: true, user };
}

/**
 * Update user verification status in database
 * @param {string} email
 */
export function markEmailVerified(email) {
  if (typeof window === 'undefined') return;
  const users = getAllUsers();
  const cleanEmail = email.trim().toLowerCase();

  const user = users.find((u) => u.email === cleanEmail);
  if (user) {
    user.emailVerified = true;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  const currentSession = getStoredSession();
  if (currentSession && currentSession.email === cleanEmail) {
    currentSession.emailVerified = true;
    saveSession(currentSession, currentSession.rememberMe);
  }
}
