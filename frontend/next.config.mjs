import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from the parent directory's .env file
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicitly expose these variables to the browser so Next.js replaces them at build/dev time
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_API_URL: process.env.CLIENT_URL ? `${process.env.CLIENT_URL.replace('3000', '5000')}/api` : 'http://localhost:5000/api',
  }
};

export default nextConfig;
