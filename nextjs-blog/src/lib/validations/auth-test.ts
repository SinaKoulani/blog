import { z } from "zod";


export const loginSchema = z.object({
    email: z.string().min (1, "Email is required" ).email("enter valid email"),
    password: z.string().min(1, "password is required").max(254 , "password is too long"),
});
export type LoginInput= z.infer<typeof loginSchema>;
