"use client"

import React, { useEffect } from "react";
import SidebarNav from "./components/sidebar-nav";
import { useAuth } from "@/lib/hooks/auth";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
    children
}:{
    children: React.ReactNode
}){
    const { user, loading} = useAuth()
    const router = useRouter()

    useEffect(()=>{
        if(!loading && !user){
            router.push("/auth/login?redirect=/dashboard")
        }
    }, [user, loading, router])

    if(loading){
        return <div>Loading...</div>
    }

    if(!user){
        return null 
    }

    return(
        <div className="flex h-screen">
            <SidebarNav/>
            <div className="flex flex-col flex-1 overflow-hidden">
                <main className="flex-1 relative overflow-y-auto focus:outline-none">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">{children}</div>
                    </div>
                </main>
            </div>
        </div>
    )
}