import { MongoClient } from 'mongodb';

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Extender el tipo de usuario para incluir _id como string
declare module 'mongodb' {
  interface UserDocument {
    _id?: any;
    email: string;
    password: string;
    firstName: string;
    lastName?: string;
    createdAt: Date;
    updatedAt: Date;
  }
}