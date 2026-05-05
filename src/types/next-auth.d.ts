import "next-auth";

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
  }
}

declare module "next-auth" {
  interface Session {
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      /** From DB on each session read — `USER` or `ADMIN`. */
      role?: string | null;
    };
  }
}

