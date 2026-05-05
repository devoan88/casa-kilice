import { z } from "zod";

const WEAK = new Set(["password", "12345678", "qwerty123", "password123", "letmein1", "welcome1"]);

/** Shared password rules for signup / Muse registration (credentials use same min in auth). */
export const passwordPolicySchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(128, "Password is too long.")
  .refine((p) => !/\s/.test(p), "Password must not contain spaces.")
  .refine((p) => /[a-z]/.test(p) && /[A-Z]/.test(p), "Use upper and lower case letters.")
  .refine((p) => /\d/.test(p), "Include at least one digit.")
  .refine((p) => WEAK.has(p.toLowerCase()) === false, "This password is too common. Choose a stronger one.");
