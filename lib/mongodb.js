import dbConnect from './mongoose';

/**
 * The native MongoClient that NextAuth's MongoDBAdapter needs.
 *
 * It is borrowed from the Mongoose connection rather than opened separately.
 * Two clients against the same database doubled the connection count for no
 * benefit, which matters on Atlas tiers with a low connection cap.
 *
 * Both resolve the database the same way — from the connection string, falling
 * back to `test` — so the adapter reads and writes exactly where it did before.
 */
const clientPromise = dbConnect().then((instance) => instance.connection.getClient());

export default clientPromise;
