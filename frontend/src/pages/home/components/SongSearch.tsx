import { axiosInstance } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePlayerStore } from "@/stores/usePlayerStore";
import type { Song } from "@/types";
import { Pause, Play, Search, X } from "lucide-react";
import { useDeferredValue, useEffect, useState } from "react";

const SongSearch = () => {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<Song[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const deferredQuery = useDeferredValue(query);
	const normalizedQuery = deferredQuery.trim();
	const { currentSong, isPlaying, playAlbum, togglePlay } = usePlayerStore();

	useEffect(() => {
		if (!normalizedQuery) {
			setResults([]);
			setError(null);
			setIsSearching(false);
			return;
		}

		const controller = new AbortController();
		const timeoutId = window.setTimeout(async () => {
			setIsSearching(true);
			setError(null);

			try {
				const response = await axiosInstance.get("/external/search", {
					params: { query: normalizedQuery, limit: 20 },
					signal: controller.signal,
				});

				setResults(response.data);
			} catch (searchError: any) {
				if (searchError?.code === "ERR_CANCELED") return;
				setResults([]);
				setError(searchError.response?.data?.message ?? searchError.message ?? "Search failed");
			} finally {
				if (!controller.signal.aborted) setIsSearching(false);
			}
		}, 250);

		return () => {
			controller.abort();
			window.clearTimeout(timeoutId);
		};
	}, [normalizedQuery]);

	const handlePlay = (song: Song, songIndex: number) => {
		if (currentSong?._id === song._id) {
			togglePlay();
			return;
		}

		playAlbum(results, songIndex);
	};

	return (
		<section className='mb-8 rounded-xl border border-zinc-700/60 bg-zinc-900/70 p-4 sm:p-5 backdrop-blur-sm'>
			<div className='mb-3 flex items-center justify-between gap-4'>
				<div className='flex items-center gap-2 text-zinc-200'>
					<Search className='size-4' />
					<h2 className='text-sm font-semibold uppercase tracking-wide'>Search Songs</h2>
				</div>
				{normalizedQuery && (
					<span className='text-xs text-zinc-400'>
						{isSearching ? "Searching..." : `${results.length} result${results.length === 1 ? "" : "s"}`}
					</span>
				)}
			</div>

			<div className='relative'>
				<Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400' />
				<Input
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					placeholder='Search by title or artist'
					className='h-11 border-zinc-700 bg-zinc-800/70 pl-10 pr-10 text-zinc-100 placeholder:text-zinc-400 focus-visible:ring-zinc-500'
				/>
				{query && (
					<Button
						type='button'
						size='icon'
						variant='ghost'
						onClick={() => setQuery("")}
						className='absolute right-1 top-1/2 size-8 -translate-y-1/2 text-zinc-400 hover:bg-zinc-700/60 hover:text-white'
						aria-label='Clear search'
					>
						<X className='size-4' />
					</Button>
				)}
			</div>

			{normalizedQuery && (
				<div className='mt-4 rounded-lg border border-zinc-700/60 bg-zinc-800/40'>
					{error ? (
						<p className='px-4 py-6 text-center text-sm text-red-400'>{error}</p>
					) : isSearching ? (
						<p className='px-4 py-6 text-center text-sm text-zinc-400'>Searching songs...</p>
					) : results.length === 0 ? (
						<p className='px-4 py-6 text-center text-sm text-zinc-400'>No matching songs found.</p>
					) : (
						<ul className='max-h-72 divide-y divide-zinc-700/60 overflow-y-auto'>
							{results.map((song, songIndex) => {
								const isCurrentSong = currentSong?._id === song._id;

								return (
									<li
										key={song._id}
										className='flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-zinc-700/40'
									>
										<img
											src={song.imageUrl}
											alt={song.title}
											className='h-11 w-11 rounded-md object-cover'
										/>
										<div className='min-w-0 flex-1'>
											<p className='truncate text-sm font-medium text-zinc-100'>{song.title}</p>
											<p className='truncate text-xs text-zinc-400'>{song.artist}</p>
										</div>
										<Button
											type='button'
											size='icon'
											onClick={() => handlePlay(song, songIndex)}
											className='bg-green-500 text-black hover:bg-green-400'
											aria-label={
												isCurrentSong && isPlaying ? `Pause ${song.title}` : `Play ${song.title}`
											}
										>
											{isCurrentSong && isPlaying ? (
												<Pause className='size-4' />
											) : (
												<Play className='size-4' />
											)}
										</Button>
									</li>
								);
							})}
						</ul>
					)}
				</div>
			)}
		</section>
	);
};

export default SongSearch;
