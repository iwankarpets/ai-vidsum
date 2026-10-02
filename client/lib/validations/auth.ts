import * as z from "zod";


export const loginSchema =  z.object({
    email: z.string().email("Imvalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long")
})


export const registerSchema =  z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Imvalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string().min(1, "Confirm password is required")
})
.refine((data)=> data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
})


export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>