import NextAuth from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default NextAuth(authOptions as any);
