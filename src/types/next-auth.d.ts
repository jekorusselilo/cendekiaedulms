import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      nama: string;
      nim: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    nama: string;
    nim: string;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    nama: string;
    nim: string;
    role: string;
  }
}