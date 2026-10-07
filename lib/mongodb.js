// This approach is taken from https://github.com/vercel/next.js/tree/canary/examples/with-mongodb
//
// NextAuth's MongoDBAdapter gets its own MongoClient from the project's `mongodb`
// package rather than borrowing Mongoose's. The adapter builds ObjectIds with
// that package (v5), and Mongoose ships its own newer driver (v7) that rejects
// BSON values from another major version with "Unsupported BSON version".
// Sharing the client therefore broke every sign-in. The cost of keeping them
// separate is one extra connection pool.
import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;
