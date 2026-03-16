import { axiosInstance } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { usePlaylistStore } from "@/stores/usePlaylistStore";
import type { Song } from "@/types";
import { useAuth } from "@clerk/clerk-react";
import { Clock3, ListMusic, Loader, Pause, Play, Plus, Search, Trash2 } from "lucide-react";
import { useDeferredValue, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

const formatDuration = (seconds: number) => {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const PlaylistPage = () => {
	const navigate = useNavigate();
	const { playlistId } = useParams();
	const { isSignedIn } = useAuth();
	const { currentSong, isPlaying, playAlbum, togglePlay } = usePlayerStore();
	const {
		playlists,
		isLoading: isPlaylistLoading,
		hasLoaded,
		fetchPlaylists,
		renamePlaylist,
		deletePlaylist,
		addSongToPlaylist,
		removeSongFromPlaylist,
	} = usePlaylistStore();
	const playlist = playlists.find((item) => item._id === playlistId);
	const [playlistName, setPlaylistName] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<Song[]>([]);
	const [searchError, setSearchError] = useState<string | null>(null);
	const [isSearching, setIsSearching] = useState(false);
	const deferredSearchQuery = useDeferredValue(searchQuery);
	const normalizedSearchQuery = deferredSearchQuery.trim();
	const coverImage = playlist?.songs[0]?.imageUrl;

	useEffect(() => {
		if (!playlist) return;
		setPlaylistName(playlist.name);
	}, [playlist]);

	useEffect(() => {
		if (!isSignedIn || hasLoaded || isPlaylistLoading) return;

		fetchPlaylists().catch((error: any) => {
			console.log("Error fetching playlists", error);
		});
	}, [isSignedIn, hasLoaded, isPlaylistLoading, fetchPlaylists]);

	useEffect(() => {
		if (!normalizedSearchQuery) {
			setSearchResults([]);
			setSearchError(null);
			setIsSearching(false);
			return;
		}

		const controller = new AbortController();
		const timeoutId = window.setTimeout(async () => {
			setIsSearching(true);
			setSearchError(null);

			try {
				const response = await axiosInstance.get("/external/search", {
					params: { query: normalizedSearchQuery, limit: 12 },
					signal: controller.signal,
				});
				setSearchResults(response.data);
			} catch (error: any) {
				if (error?.code === "ERR_CANCELED") return;
				setSearchResults([]);
				setSearchError(error.response?.data?.message ?? error.message ?? "Failed to search songs");
			} finally {
				if (!controller.signal.aborted) setIsSearching(false);
			}
		}, 250);

		return () => {
			controller.abort();
			window.clearTimeout(timeoutId);
		};
	}, [normalizedSearchQuery]);

	if (!playlist) {
		if (!isSignedIn) {
			return (
				<div className='flex h-full items-center justify-center rounded-md bg-zinc-900'>
					<div className='max-w-md space-y-3 px-6 text-center'>
						<div className='mx-auto flex size-14 items-center justify-center rounded-full bg-zinc-800 text-zinc-300'>
							<ListMusic className='size-6' />
						</div>
						<h1 className='text-2xl font-bold text-white'>Sign in to view playlists</h1>
						<p className='text-sm text-zinc-400'>
							Playlists are now saved to your account instead of only this browser session.
						</p>
						<Button onClick={() => navigate("/")} className='bg-white text-black hover:bg-zinc-200'>
							Back Home
						</Button>
					</div>
				</div>
			);
		}

		if (isPlaylistLoading || !hasLoaded) {
			return (
				<div className='flex h-full items-center justify-center rounded-md bg-zinc-900 text-zinc-300'>
					<div className='flex items-center gap-3'>
						<Loader className='size-5 animate-spin' />
						<span>Loading playlist...</span>
					</div>
				</div>
			);
		}

		return (
			<div className='flex h-full items-center justify-center rounded-md bg-zinc-900'>
				<div className='max-w-md space-y-3 px-6 text-center'>
					<div className='mx-auto flex size-14 items-center justify-center rounded-full bg-zinc-800 text-zinc-300'>
						<ListMusic className='size-6' />
					</div>
					<h1 className='text-2xl font-bold text-white'>Playlist not found</h1>
					<p className='text-sm text-zinc-400'>
						This playlist may have been deleted from your account. Pick another one from the sidebar or create a new playlist.
					</p>
					<Button onClick={() => navigate("/")} className='bg-white text-black hover:bg-zinc-200'>
						Back Home
					</Button>
				</div>
			</div>
		);
	}

	const savePlaylistName = async () => {
		const normalizedName = playlistName.trim() || "New Playlist";
		setPlaylistName(normalizedName);
		if (normalizedName === playlist.name) return;

		try {
			await renamePlaylist(playlist._id, normalizedName);
		} catch (error: any) {
			toast.error(error?.response?.data?.message ?? error?.message ?? "Failed to rename playlist");
			setPlaylistName(playlist.name);
		}
	};

	const handleDeletePlaylist = async () => {
		if (!window.confirm(`Delete "${playlist.name}"?`)) return;

		try {
			await deletePlaylist(playlist._id);
			toast.success("Playlist deleted");
			navigate("/");
		} catch (error: any) {
			toast.error(error?.response?.data?.message ?? error?.message ?? "Failed to delete playlist");
		}
	};

	const handlePlayPlaylist = () => {
		if (playlist.songs.length === 0) return;

		const isCurrentPlaylistPlaying = playlist.songs.some((song) => song._id === currentSong?._id);
		if (isCurrentPlaylistPlaying) {
			togglePlay();
			return;
		}

		playAlbum(playlist.songs, 0);
	};

	const handlePlaySong = (songIndex: number) => {
		playAlbum(playlist.songs, songIndex);
	};

	const handleAddSong = async (song: Song) => {
		try {
			const added = await addSongToPlaylist(playlist._id, song);

			if (!added) {
				toast("Song already exists in this playlist");
				return;
			}

			toast.success(`Added "${song.title}"`);
		} catch (error: any) {
			toast.error(error?.response?.data?.message ?? error?.message ?? "Failed to add song");
		}
	};

	const handleRemoveSong = async (songId: string) => {
		try {
			await removeSongFromPlaylist(playlist._id, songId);
		} catch (error: any) {
			toast.error(error?.response?.data?.message ?? error?.message ?? "Failed to remove song");
		}
	};

	return (
		<div className='h-full'>
			<ScrollArea className='h-full rounded-md'>
				<div className='relative min-h-full'>
					<div
						className='pointer-events-none absolute inset-0 bg-gradient-to-b from-emerald-700/50 via-zinc-900/85 to-zinc-950'
						aria-hidden='true'
					/>

					<div className='relative z-10'>
						<div className='flex flex-col gap-6 p-6 pb-8 lg:flex-row'>
							{coverImage ? (
								<img
									src={coverImage}
									alt={playlist.name}
									className='h-[240px] w-[240px] rounded object-cover shadow-2xl'
								/>
							) : (
								<div className='flex h-[240px] w-[240px] items-center justify-center rounded bg-gradient-to-br from-zinc-800 via-zinc-900 to-black shadow-2xl'>
									<div className='text-center text-zinc-400'>
										<ListMusic className='mx-auto mb-4 size-16' />
										<p className='text-sm uppercase tracking-[0.3em]'>Empty Playlist</p>
									</div>
								</div>
							)}

							<div className='flex flex-1 flex-col justify-end'>
								<p className='text-sm font-medium uppercase tracking-[0.3em] text-zinc-200'>Playlist</p>
								<Input
									value={playlistName}
									onChange={(event) => setPlaylistName(event.target.value)}
									onBlur={savePlaylistName}
									onKeyDown={(event) => {
										if (event.key === "Enter") {
											event.preventDefault();
											savePlaylistName();
										}
									}}
									className='my-4 h-auto border-none bg-transparent px-0 text-4xl font-bold text-white shadow-none focus-visible:ring-0 md:text-6xl'
									maxLength={60}
								/>
								<div className='flex flex-wrap items-center gap-2 text-sm text-zinc-200'>
									<span className='font-medium text-white'>Saved to your account</span>
									<span>• {playlist.songs.length} songs</span>
									<span>• cover updates from the first song added</span>
								</div>

								<div className='mt-6 flex flex-wrap items-center gap-3'>
									<Button
										onClick={handlePlayPlaylist}
										size='icon'
										className='size-14 rounded-full bg-green-500 text-black hover:scale-105 hover:bg-green-400'
										disabled={playlist.songs.length === 0}
									>
										{isPlaying && playlist.songs.some((song) => song._id === currentSong?._id) ? (
											<Pause className='size-7' />
										) : (
											<Play className='size-7' />
										)}
									</Button>
									<Button
										variant='outline'
										onClick={savePlaylistName}
										className='border-zinc-700 bg-zinc-900/80 text-white hover:bg-zinc-800'
									>
										Save Name
									</Button>
									<Button
										variant='outline'
										onClick={handleDeletePlaylist}
										className='border-zinc-700 bg-zinc-900/80 text-white hover:bg-zinc-800'
									>
										<Trash2 className='mr-2 size-4' />
										Delete Playlist
									</Button>
								</div>
							</div>
						</div>

						<div className='grid gap-6 px-6 pb-8 xl:grid-cols-[minmax(0,1.6fr)_420px]'>
							<div className='rounded-2xl border border-white/5 bg-black/20 backdrop-blur-sm'>
								<div className='grid grid-cols-[16px_minmax(0,4fr)_72px_48px] gap-4 border-b border-white/5 px-6 py-3 text-sm text-zinc-400'>
									<div>#</div>
									<div>Title</div>
									<div>
										<Clock3 className='size-4' />
									</div>
									<div />
								</div>

								<div className='px-3 py-4'>
									{playlist.songs.length === 0 ? (
										<div className='rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 p-8 text-center'>
											<p className='text-lg font-semibold text-white'>No songs in this playlist yet</p>
											<p className='mt-2 text-sm text-zinc-400'>
												Use the search panel to add songs. The first track you add becomes the playlist cover.
											</p>
										</div>
									) : (
										<div className='space-y-2'>
											{playlist.songs.map((song, index) => {
												const isCurrentSong = currentSong?._id === song._id;

												return (
													<div
														key={song._id}
														onClick={() => handlePlaySong(index)}
														className='grid cursor-pointer grid-cols-[16px_minmax(0,4fr)_72px_48px] gap-4 rounded-md px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-white/5'
													>
														<div className='flex items-center justify-center'>
															{isCurrentSong && isPlaying ? (
																<div className='text-green-500'>♫</div>
															) : (
																<span>{index + 1}</span>
															)}
														</div>

														<div className='flex min-w-0 items-center gap-3'>
															<img src={song.imageUrl} alt={song.title} className='size-10 rounded object-cover' />
															<div className='min-w-0'>
																<div className='truncate font-medium text-white'>{song.title}</div>
																<div className='truncate text-zinc-400'>{song.artist}</div>
															</div>
														</div>

														<div className='flex items-center text-zinc-400'>{formatDuration(song.duration)}</div>

														<div className='flex items-center justify-end'>
															<Button
																type='button'
																variant='ghost'
																size='icon'
																onClick={(event) => {
																	event.stopPropagation();
																	handleRemoveSong(song._id);
																}}
																className='text-zinc-400 hover:bg-zinc-800 hover:text-white'
																aria-label={`Remove ${song.title}`}
															>
																<Trash2 className='size-4' />
															</Button>
														</div>
													</div>
												);
											})}
										</div>
									)}
								</div>
							</div>

							<div className='rounded-2xl border border-white/5 bg-zinc-950/70 p-5'>
								<div className='mb-4'>
									<h2 className='text-xl font-semibold text-white'>Add Songs</h2>
									<p className='mt-1 text-sm text-zinc-400'>
										Search the full external catalog and save tracks into this playlist.
									</p>
								</div>

								<div className='relative'>
									<Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500' />
									<Input
										value={searchQuery}
										onChange={(event) => setSearchQuery(event.target.value)}
										placeholder='Search by title or artist'
										className='border-zinc-800 bg-zinc-900 pl-10'
									/>
								</div>

								<div className='mt-4 space-y-3'>
									{normalizedSearchQuery ? (
										isSearching ? (
											<p className='text-sm text-zinc-400'>Searching songs...</p>
										) : searchError ? (
											<p className='text-sm text-red-400'>{searchError}</p>
										) : searchResults.length === 0 ? (
											<p className='text-sm text-zinc-400'>No songs found for this search.</p>
										) : (
											searchResults.map((song) => {
												const alreadyAdded = playlist.songs.some((playlistSong) => playlistSong._id === song._id);

												return (
													<div
														key={song._id}
														className='flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/70 p-3'
													>
														<img
															src={song.imageUrl}
															alt={song.title}
															className='size-12 rounded-md object-cover'
														/>
														<div className='min-w-0 flex-1'>
															<p className='truncate font-medium text-white'>{song.title}</p>
															<p className='truncate text-sm text-zinc-400'>{song.artist}</p>
														</div>
														<Button
															type='button'
															size='sm'
															onClick={() => handleAddSong(song)}
															disabled={alreadyAdded}
															className='bg-green-500 text-black hover:bg-green-400 disabled:bg-zinc-800 disabled:text-zinc-500'
														>
															<Plus className='mr-1 size-4' />
															{alreadyAdded ? "Added" : "Add"}
														</Button>
													</div>
												);
											})
										)
									) : (
										<div className='rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 p-5 text-sm text-zinc-400'>
											Start typing to search the external catalog and build this playlist.
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</ScrollArea>
		</div>
	);
};

export default PlaylistPage;
