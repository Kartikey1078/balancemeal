import { Client, Environment } from 'square';

export const squareEnv = 'sandbox';
export const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN!,
  // Production env disabled for sandbox-only setup.
  // environment: squareEnv === 'production' ? Environment.Production : Environment.Sandbox,
  environment: Environment.Sandbox,
});
