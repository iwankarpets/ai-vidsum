"use client"

import { registerSchema, RegisterSchema } from '@/lib/validations/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import  { useForm } from 'react-hook-form'

export default function RegisterPage(){
    const form = useForm<RegisterSchema>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: ""
        }
    })

    const onSubmit = (data: RegisterSchema)=>{
        try {
            
        } catch (error) {
            
        }
    }
    
    return(
    <div>
        <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
            <p className="text-sm text-muted-foreground">
                Enter your details below to create an account
            </p>
        </div>
    </div>
    ) 
}


