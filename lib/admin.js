/**
 * Who may use the admin panel.
 *
 * Google sign-in on its own lets any Google account in, so access is limited to
 * the comma-separated addresses in ADMIN_EMAILS. In production an empty list
 * means nobody gets in — failing closed. In development it stays open so a fresh
 * checkout works before the variable is set, with a warning in the console.
 */

let warned = false;

export function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email) {
  const admins = getAdminEmails();

  if (admins.length === 0) {
    const isProduction = process.env.NODE_ENV === 'production';
    if (!warned) {
      warned = true;
      console.warn(
        isProduction
          ? '[auth] ADMIN_EMAILS is not set — every sign-in is refused. Set it to the admin Google addresses.'
          : '[auth] ADMIN_EMAILS is not set — any Google account can sign in (development only).'
      );
    }
    return !isProduction;
  }

  return admins.includes(String(email || '').trim().toLowerCase());
}
