import { useState } from "react";
import { SignedOut, UserButton } from "@clerk/clerk-react";
import { LayoutDashboardIcon, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import SignInOauthButton from "./SignInOauthButton";
import { useAuthStore } from "@/stores/useAuthStore";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/layout/ThemeToggle";
import LeftSidebar from "@/layout/components/LeftSidebar";

const Topbar = () => {
    const { isAdmin } = useAuthStore();
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    return (
        <header className="sticky top-0 z-20 mb-2">
            <div className="glass-panel rounded-xl px-3 sm:px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                    <button
                        type="button"
                        className="inline-flex md:hidden h-11 w-11 items-center justify-center rounded-full bg-black/40 border border-white/20 hover:bg-black/60 transition-colors"
                        onClick={() => setMobileSidebarOpen(true)}
                        aria-label="Open navigation menu"
                    >
                        <Menu className="size-5" />
                    </button>

                    <div className="flex items-center gap-2">
                        <img
                            src="/cadence-high-resolution-logo-transparent.png"
                            alt="Cadence Logo"
                            className="h-8 w-auto object-contain"
                        />
                        <span className="hidden sm:inline text-sm font-medium tracking-wide text-zinc-100">
                          
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    <ThemeToggle />

                    {isAdmin && (
                        <Link
                            to={"/admin"}
                            className={cn(
                                buttonVariants({ variant: "outline" }),
                                "hidden sm:inline-flex border-white/25 bg-black/30 hover:bg-white/10"
                            )}
                        >
                            <LayoutDashboardIcon className="size-4 mr-2" />
                            <span className="text-xs sm:text-sm">Admin Dashboard</span>
                        </Link>
                    )}

                    <SignedOut>
                        <SignInOauthButton />
                    </SignedOut>

                    <UserButton />
                </div>
            </div>

            {mobileSidebarOpen && (
                <div className="fixed inset-0 z-30 flex md:hidden">
                    <button
                        type="button"
                        className="flex-1 bg-black/60"
                        onClick={() => setMobileSidebarOpen(false)}
                        aria-label="Close navigation menu"
                    />
                    <div className="w-[80%] max-w-xs h-full glass-panel rounded-l-xl overflow-hidden">
                        <LeftSidebar />
                    </div>
                </div>
            )}
        </header>
    );
};
export default Topbar;