"use client"

import { HistoryIcon, LogOutIcon, PlayIcon, UserIcon, VideoIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/auth";

const navigation = [
    {
        name: "New Video",
        href: "/dashboard",
        icon: VideoIcon,
        description: "Upload a new video to be processed"
    },
    {
        name: "My Videos",
        href: "/dashboard/videos",
        icon: PlayIcon,
        description: "View your upload videos"
    },
    {
        name: "Processing",
        href: "/dashboard/history",
        icon: HistoryIcon,
        description: "View your video processing history"
    },
    {
        name: "Profile",
        href: "/dashboard/profile",
        icon: UserIcon,
        description: "Manage your account settings"
    },
]

export default function SidebarNav(){
    const pathName = usePathname()
    const {user, logout} =  useAuth()

    return(
        <div className="hidden md:flex md:w-72 md:flex-col">
            <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
                <div className="flex items-center h-16 flex-shrink-0 px-6 border-b border-gray-200">
                    <Link href="/dashboard" className="flex items-center gap-2">
                     <Image
                            src="/logo.svg"
                            alt="logo"
                            width={32}
                            height={32}
                            className="w-8 h-8"
                            />
                        <span className="text-xl font-bold">Video Processor</span>
                    </Link>
                </div>
                <div className="flex-grow flex flex-col pt-5 pb-4 overflow-y-auto">
                    <nav className="flex-1 px-3 space-y-2">
                        {navigation.map((item)=>{
                            const isActive = pathName === item.href;
                            return(
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={
                                        cn(
                                            "group relative flex items-center px-4 py-3 text-sm rounded-lg transition-all duration-200 ease-in-out",
                                            isActive
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "text-gray-700 hover:bg-gray-100"
                                        )
                                    }
                                >
                                    <item.icon
                                    className={cn(
                                        "flex-shrink-0 size-5 transition-colors duration-200",
                                        isActive
                                            ? "text-primary-foreground"
                                            : "text-gray-500 group-hover:text-gray-700"
                                    )}
                                    arria-hidden="true"
                                    />
                                    <div className="ml-3 flex flex-col">
                                        <span className="font-medium">
                                            {item.name}
                                        </span>
                                        <span
                                            className={cn(
                                                "text-x5 mt-0.5",
                                                isActive
                                                    ? "text-primary-foreground/80"
                                                    : "text-gray-500"
                                            )}
                                        >
                                            {item.description}
                                        </span>
                                    </div>
                                    {
                                        isActive && (
                                            <span className="absolute right-2 size-1.5 rounded-full bg-primary-foregrounded/80"
                                            aria-hidden="true"
                                            />
                                        )
                                    }
                                </Link>
                            )
                        })}
                    </nav>
                    <div className="px-3 pb-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                              Logged in as <span className="font-medium">{user?.name}</span>  
                            </p>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="p-2"
                                onClick={logout}
                                >
                                <LogOutIcon className="size-4"/>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
     ) 
}