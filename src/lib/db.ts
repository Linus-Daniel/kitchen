import mongoose, { Mongoose } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

console.log(MONGODB_URI)

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

interface MongooseGlobal {
  mongoose?: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  };
}

// Ensure `globalThis` has the correct shape for `mongoose` caching
const globalWithMongoose = globalThis as typeof globalThis & MongooseGlobal;

if (!globalWithMongoose.mongoose) {
  globalWithMongoose.mongoose = { conn: null, promise: null };
}

async function connectDB(): Promise<Mongoose> {
  if (globalWithMongoose.mongoose!.conn) {
    return globalWithMongoose.mongoose!.conn!;
  }

  if (!globalWithMongoose.mongoose!.promise) {
    const opts = {
      bufferCommands: false,
    };

    globalWithMongoose.mongoose!.promise = mongoose.connect(MONGODB_URI as unknown as string, opts).then((mongoose) => mongoose);
  }

  try {
    globalWithMongoose.mongoose!.conn = await globalWithMongoose.mongoose!.promise;
  } catch (e) {
    globalWithMongoose.mongoose!.promise = null;
    throw e;
  }

  return globalWithMongoose.mongoose!.conn!;
}

export default connectDB;
