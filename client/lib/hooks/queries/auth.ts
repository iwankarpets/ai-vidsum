import { useRouter } from "next/navigation";
import { useAuth } from "../auth";
import { authApi } from "@/lib/api/auth";
import { useMutation } from "@tanstack/react-query";

export function useLogin(){
    const { login } = useAuth();
    const router = useRouter()

    return useMutation({
        mutationFn: (data: any)=> authApi.login(data),
        onSuccess: (data)=>{
            login(data.token, data.user);
            router.push("/dashboard")
        }
    })
}

export function useRegister(){
    const { register } = useAuth();
    const router = useRouter()

    return useMutation({
        mutationFn: (data: any)=> authApi.register(data),
        onSuccess: (data)=>{
            register(data.user);
            router.push("/dashboard")
        }
    })
}
