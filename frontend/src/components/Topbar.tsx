import { useState } from "react";
import { SignedOut, UserButton } from "@clerk/clerk-react";
import { LayoutDashboardIcon, Menu, X } from "lucide-react";
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
                <div className="fixed inset-0 z-30 md:hidden">
                    <button
                        type="button"
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => setMobileSidebarOpen(false)}
                        aria-label="Close navigation menu"
                    />

                    <div className="relative h-full px-3 py-4 flex justify-start">
                        <div className="glass-panel rounded-2xl w-full max-w-sm h-full flex flex-col overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-white/15">
                                <div className="flex items-center gap-2">
                                    <img
                                        src="/cadence-high-resolution-logo-transparent.png"
                                        alt="Cadence Logo"
                                        className="h-7 w-auto object-contain"
                                    />
                                    <span className="text-sm font-semibold tracking-wide">Library</span>
                                </div>

                                <button
                                    type="button"
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/40 border border-white/20 hover:bg-black/60 transition-colors"
                                    onClick={() => setMobileSidebarOpen(false)}
                                    aria-label="Close navigation menu"
                                >
                                    <X className="size-4" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-3">
                                <LeftSidebar />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};
export default Topbar;