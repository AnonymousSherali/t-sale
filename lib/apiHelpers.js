import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

/**
 * Rejects the request with 401 when there is no signed-in session.
 * Returns the session when authenticated, otherwise null (response already sent).
 */
export async function requireSession(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).json({ success: false, error: 'Tizimga kirish talab qilinadi' });
    return null;
  }
  return session;
}

/**
 * Copies only the allowed keys out of a request body so clients cannot set
 * fields the API never meant to expose (_id, orderNumber, timestamps, ...).
 */
export function pickFields(body, allowedFields) {
  const result = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) result[field] = body[field];
  }
  return result;
}

/**
 * Turns a Mongoose/Mongo error into a message that makes sense to the user.
 */
export function formatDbError(error) {
  if (error?.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0];
    if (field === 'sku') return 'Bu SKU allaqachon mavjud. Boshqa SKU kiriting.';
    return "Bunday yozuv allaqachon mavjud.";
  }

  if (error?.name === 'ValidationError') {
    return Object.values(error.errors)
      .map((e) => e.message)
      .join(', ');
  }

  if (error?.name === 'CastError') {
    return "Noto'g'ri ma'lumot formati.";
  }

  return error?.message || 'Server xatosi yuz berdi';
}

/**
 * Shared error responder for API route catch blocks.
 */
export function sendError(res, error, status = 400) {
  console.error(error);
  res.status(status).json({ success: false, error: formatDbError(error) });
}
