import { z } from "zod";

export const userNameValidation = z
  .string()
  .min(2, "User name must be atleast 2 characters")
  .max(20, "User name must be no more than 20 characters");

export const signUpSchema = z.object({
  username: userNameValidation,
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 character" }),
});
