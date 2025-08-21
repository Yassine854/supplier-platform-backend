import serverless from 'serverless-http';
import mongoose from 'mongoose';
import { app } from '../../src/app';
import { getEnv } from '../../src/utils/env';

// Reuse the MongoDB connection between invocations when the function container is warm
let connectPromise: Promise<typeof mongoose> | null = null;

async function ensureDbConnection() {
  if (mongoose.connection.readyState === 1) {
    return; // already connected
  }
  if (!connectPromise) {
    connectPromise = mongoose.connect(getEnv('DB_URL'));
  }
  await connectPromise;
}

const expressHandler = serverless(app, {
  // Ensure Netlify base64 bodies are decoded for multipart/form-data uploads
  binary: (headers: any) => {
    const contentType = headers['content-type'] || '';
    return contentType.startsWith('multipart/form-data') || 
           contentType.startsWith('application/octet-stream') ||
           contentType.startsWith('image/');
  }
});

export const handler = async (event: any, context: any) => {
  // Prevent Lambda from waiting for the Node.js event loop to be empty
  context.callbackWaitsForEmptyEventLoop = false;

  // Ensure database is connected before handling the request
  await ensureDbConnection();

  // Delegate to the Express app wrapped by serverless-http
  return await expressHandler(event, context);
};
