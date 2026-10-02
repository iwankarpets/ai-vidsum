"use client"
import { AuthProvider } from "@/lib/hooks/auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function ClientProviders ({children}: {children: React.ReactNode}){
    const [quryClient] = useState(
        ()=>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 1000 * 60 *5,
                        retry: 1,
                    }
                }
            })
    )

    return (
        <QueryClientProvider client={quryClient}>
            <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
    )
}