import { query } from '$app/server';
import { z } from 'zod/v4';

// Simple remote function that makes the point.
export const toUpper = query(z.string(), async (input) => {
  console.log('backend: toUpper', input);
  console.log('You should see this in your backend console.');
  return input.toUpperCase();
});
