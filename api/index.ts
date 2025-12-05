import { createApp } from '../server/app.ts';

// Vercel serverless function entry: export the Express app
const app = createApp();
export default app;