import { SignedOut, SignOutButton, SignedIn } from "@clerk/clerk-react"
import { LayoutDashboardIcon } from "lucide-react"
import { Link } from "react-router-dom"
import SignInOauthButton from "./SignInOauthButton"

const Topbar=()=>{
    const isAdmin = false
    return (
        <div className="flex items-center justify-between p-4 sticky top-0 bg-red-500/75 backdrop-blur-md z-10">

        <div className="flex gap-2 items-center">Cadence</div>

        <div className="flex gap-4 items-center">
            {isAdmin && (
            <Link to={"/admin"}>
                <LayoutDashboardIcon className="size-4 mr-2"/>
                Admin Dashboard
            </Link>)}
        </div>
        <SignedOut>
            <SignInOauthButton/>
        </SignedOut>
        <SignedIn>
            <SignOutButton>Sign Out</SignOutButton>
        </SignedIn>
        </div>
        
    )
}
export default Topbar;