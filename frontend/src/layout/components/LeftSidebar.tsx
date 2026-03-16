import AddPlaylistDialog from "@/layout/components/AddPlaylistDialog";
import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { usePlaylistStore } from "@/stores/usePlaylistStore";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { HomeIcon, Library, ListMusic, MessageCircle } from "lucide-react";
import { Link, NavLink } from "react-router-dom";

const LeftSidebar = () => {
	const playlists = usePlaylistStore((state) => state.playlists);

	return (
		<div className='flex h-full flex-col gap-2'>
			<div className='rounded-lg bg-zinc-900 p-4'>
				<div className='space-y-2'>
					<Link
						to='/'
						className={cn(
							buttonVariants({
								variant: "ghost",
								className: "w-full justify-start text-white hover:bg-zinc-800",
							})
						)}
					>
						<HomeIcon className='mr-2 size-5' />
						<span className='hidden md:inline'>Home</span>
					</Link>

					<SignedIn>
						<Link
							to='/chat'
							className={cn(
								buttonVariants({
									variant: "ghost",
									className: "w-full justify-start text-white hover:bg-zinc-800",
								})
							)}
						>
							<MessageCircle className='mr-2 size-5' />
							<span className='hidden md:inline'>Messages</span>
						</Link>
					</SignedIn>
				</div>
			</div>

			<div className='flex-1 rounded-lg bg-zinc-900 p-4'>
				<div className='mb-4 flex items-center justify-between gap-3'>
					<div className='flex items-center px-2 text-white'>
						<Library className='mr-2 size-5' />
						<span className='hidden md:inline'>Playlists</span>
					</div>
					<SignedIn>
						<AddPlaylistDialog compact />
					</SignedIn>
				</div>

				<SignedOut>
					<div className='rounded-xl border border-dashed border-zinc-800 bg-zinc-950/60 p-4 text-center'>
						<div className='mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-zinc-900 text-zinc-300'>
							<ListMusic className='size-5' />
						</div>
						<p className='text-sm font-medium text-white'>Sign in to save playlists</p>
						<p className='mt-1 text-sm text-zinc-400'>
							Playlists now persist to your account, so they follow you across browsers and devices.
						</p>
					</div>
				</SignedOut>

				<SignedIn>
					{playlists.length === 0 ? (
						<div className='rounded-xl border border-dashed border-zinc-800 bg-zinc-950/60 p-4 text-center'>
							<div className='mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-zinc-900 text-zinc-300'>
								<ListMusic className='size-5' />
							</div>
							<p className='text-sm font-medium text-white'>No playlists yet</p>
							<p className='mt-1 text-sm text-zinc-400'>
								Create one to start collecting songs you want to revisit from any signed-in device.
							</p>
							<div className='mt-4'>
								<AddPlaylistDialog />
							</div>
						</div>
					) : (
						<ScrollArea className='h-[calc(100vh-300px)]'>
							<div className='space-y-2'>
								{playlists.map((playlist) => {
									const coverImage = playlist.songs[0]?.imageUrl;
									const songCountLabel = `${playlist.songs.length} song${playlist.songs.length === 1 ? "" : "s"}`;

									return (
										<NavLink
											to={`/playlists/${playlist._id}`}
											key={playlist._id}
											className={({ isActive }) =>
												cn(
													"group flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-zinc-800",
													isActive && "bg-zinc-800"
												)
											}
										>
											{coverImage ? (
												<img
													src={coverImage}
													alt={playlist.name}
													className='size-12 rounded-md object-cover'
												/>
											) : (
												<div className='flex size-12 items-center justify-center rounded-md bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950 text-zinc-400'>
													<ListMusic className='size-5' />
												</div>
											)}

											<div className='hidden min-w-0 flex-1 md:block'>
												<p className='truncate font-medium text-white'>{playlist.name}</p>
												<p className='truncate text-sm text-zinc-400'>Playlist • {songCountLabel}</p>
											</div>
										</NavLink>
									);
								})}
							</div>
						</ScrollArea>
					)}
				</SignedIn>
			</div>
		</div>
	);
};

export default LeftSidebar;
