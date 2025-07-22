import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import KakaoProvider from 'next-auth/providers/kakao';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import { Session, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          emailVerified: user.emailVerified,
        };
      },
    }),
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({
      token,
      user,
      trigger,
      session,
    }: {
      token: JWT & { name?: string; email?: string };
      user?: User;
      trigger: string;
      session: { name?: string; email?: string };
    }) {
      if (user) {
        token.id = user.id;
      }

      if (trigger === 'update') {
        token.name = session.name;
        token.email = session.email;
      }

      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user && token) {
        session.user.id = token.id as string;
      }

      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
};
