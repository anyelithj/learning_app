import "next-auth";
import "next-auth/jwt";
// [Augmentation Auth.js v5]: extiende Session y JWT con campos custom usados por bridge | [Patrón]: Module Augmentation | [Principio]: SSOT tipos

declare module "next-auth" {
  interface Session {
    idToken?: string;
    provider?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    idToken?: string;
    provider?: string;
  }
}
