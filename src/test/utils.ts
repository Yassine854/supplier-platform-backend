import mongoose, { Mongoose } from 'mongoose';
import { getEnv } from '../utils/env';

export const testDbConnect = async () => {
  const baseUrl = getEnv('TEST_DB_URL');
  return await mongoose.connect(`${baseUrl}/DBurl-${Date.now()}`);
};

export const testDbCleanup = async (db: Mongoose) => {
  const databases = await db.connection.db?.admin().listDatabases();
  if (!databases) return;
  databases.databases.forEach(async (database) => {
    if (database.name.startsWith('DBurl-')) {
      await db.connection.getClient().db(database.name).dropDatabase();
    }
  });
  await db.connection.close();
};
