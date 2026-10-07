import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { MongoDBAdapter } from '@next-auth/mongodb-adapter'
import clientPromise from '@/lib/mongodb'
import { isAdminEmail } from '@/lib/admin'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  callbacks: {
    // Refuses anyone outside ADMIN_EMAILS before an account or session is created.
    async signIn({ user }) {
      return isAdminEmail(user?.email)
    },
    // Sessions created before ADMIN_EMAILS was set (or before an address was
    // removed from it) still exist in the database. Flagging them lets the UI
    // lock those users out instead of showing a panel whose API calls all fail.
    async session({ session }) {
      if (session?.user) {
        session.user.isAdmin = isAdminEmail(session.user.email)
      }
      return session
    },
  },
  pages: {
    // Send refused sign-ins back to the app's own login screen, which explains
    // the AccessDenied error in Uzbek, rather than NextAuth's default page.
    error: '/',
  },
}

export default NextAuth(authOptions)
