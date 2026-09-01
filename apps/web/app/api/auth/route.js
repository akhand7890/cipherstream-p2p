import { NextResponse } from 'next/server';

/**
 * Serverless Global User Account Database Store
 * Syncs registered accounts across different devices and browsers seamlessly.
 */

/** @type {Map<string, { name: string, email: string, password: string, emailVerified: boolean, createdAt: number }>} */
const globalUserAccounts = new Map();

export async function POST(req) {
  try {
    const body = await req.json();
    const { action, name, email, password, emailVerified, newPassword } = body;
    const cleanEmail = email ? email.trim().toLowerCase() : '';

    if (!cleanEmail) {
      return NextResponse.json({ success: false, error: 'Email address is required.' }, { status: 400 });
    }

    if (action === 'register') {
      if (globalUserAccounts.has(cleanEmail)) {
        return NextResponse.json(
          { success: false, error: 'An account with this email address already exists. Please log in.' },
          { status: 400 }
        );
      }

      const newUser = {
        name: name?.trim() || 'User',
        email: cleanEmail,
        password,
        emailVerified: !!emailVerified,
        createdAt: Date.now(),
      };

      globalUserAccounts.set(cleanEmail, newUser);
      return NextResponse.json({ success: true, user: newUser });
    }

    if (action === 'login') {
      const user = globalUserAccounts.get(cleanEmail);
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'No account found with this email address. Please sign up first.' },
          { status: 404 }
        );
      }

      if (user.password !== password) {
        return NextResponse.json(
          { success: false, error: 'Incorrect password. Please check your credentials and try again.' },
          { status: 401 }
        );
      }

      return NextResponse.json({ success: true, user });
    }

    if (action === 'resetPassword') {
      const user = globalUserAccounts.get(cleanEmail);
      if (user) {
        user.password = newPassword;
        globalUserAccounts.set(cleanEmail, user);
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'verifyEmail') {
      const user = globalUserAccounts.get(cleanEmail);
      if (user) {
        user.emailVerified = true;
        globalUserAccounts.set(cleanEmail, user);
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid action.' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
