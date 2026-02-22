import { SignedOut, SignOutButton, SignedIn, UserButton } from "@clerk/clerk-react"
import { LayoutDashboardIcon } from "lucide-react"
import { Link } from "react-router-dom"
import SignInOauthButton from "./SignInOauthButton"
import { useAuthStore } from "@/stores/useAuthStore"
import { buttonVariants } from "./ui/button"
import { cn } from "@/lib/utils"

const Topbar=()=>{
    const { isAdmin } = useAuthStore()
    console.log("Admin status in Topbar:", isAdmin)
    return (
        <div className="flex items-center justify-between p-4 sticky top-0 bg-red-500/75 backdrop-blur-md z-10 rounded-md">

       <div className="flex gap-2 items-center">
        <img 
            src="/cadence-high-resolution-logo-transparent.png" 
            alt="Cadence Logo" 
            className="h-8 w-auto object-contain"
        />

        </div>

        <div className="flex gap-4 items-center">
            {isAdmin && (
            <Link to={"/admin"} className={cn(buttonVariants({ variant: "outline" }))}>
                <LayoutDashboardIcon className="size-4 mr-2"/>
                Admin Dashboard
            </Link>)}
        
        <SignedOut>
            <SignInOauthButton/>
        </SignedOut>
        
        <UserButton/>
        </div>
        </div>
        
    )
}
export default Topbar;