import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Pause, Play, Repeat, Shuffle, SkipBack, SkipForward, Volume1 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const formatTime = (seconds: number) => {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = Math.floor(seconds % 60);
	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const PlaybackControls = () => {
	const {
		currentSong,
		isPlaying,
		togglePlay,
		playNext,
		playPrevious,
		isShuffleEnabled,
		repeatMode,
		toggleShuffle,
		cycleRepeatMode,
	} = usePlayerStore();

	const [volume, setVolume] = useState(75);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	useEffect(() => {
		audioRef.current = document.querySelector("audio");

		const audio = audioRef.current;
		if (!audio) return;

		const updateTime = () => setCurrentTime(audio.currentTime);
		const updateDuration = () => setDuration(audio.duration);

		audio.addEventListener("timeupdate", updateTime);
		audio.addEventListener("loadedmetadata", updateDuration);

		const handleEnded = () => {
			usePlayerStore.setState({ isPlaying: false });
		};

		audio.addEventListener("ended", handleEnded);

		return () => {
			audio.removeEventListener("timeupdate", updateTime);
			audio.removeEventListener("loadedmetadata", updateDuration);
			audio.removeEventListener("ended", handleEnded);
		};
	}, [currentSong]);

	const handleSeek = (value: number[]) => {
		if (audioRef.current) {
			audioRef.current.currentTime = value[0];
		}
	};

	return (
		<footer className='h-20 sm:h-24 border-t border-white/10 px-3 py-2 sm:px-4'>
			<div className='playback-shell mx-auto flex h-full max-w-[1800px] items-center justify-between rounded-[28px] px-4 sm:px-6'>
				{/* currently playing song */}
				<div className='hidden sm:flex items-center gap-4 min-w-[180px] w-[30%]'>
					{currentSong && (
						<>
							<img
								src={currentSong.imageUrl}
								alt={currentSong.title}
								className='w-14 h-14 object-cover rounded-md'
							/>
							<div className='flex-1 min-w-0'>
								<div className='font-medium truncate hover:underline cursor-pointer'>
									{currentSong.title}
								</div>
								<div className='text-sm text-zinc-400 truncate hover:underline cursor-pointer'>
									{currentSong.artist}
								</div>
							</div>
						</>
					)}
				</div>

				{/* player controls*/}
				<div className='flex flex-col items-center gap-2 flex-1 max-w-full sm:max-w-[45%]'>
					<div className='flex translate-y-1 items-center gap-3 sm:translate-y-2 sm:gap-4'>
						<Button
							size='icon'
							variant='ghost'
							className={cn(
								"hidden size-10 rounded-full text-zinc-200 hover:text-white sm:inline-flex",
								isShuffleEnabled ? "accent-bg text-black shadow-lg shadow-black/20" : "playback-control"
							)}
							onClick={toggleShuffle}
						>
							<Shuffle className='h-4 w-4' />
						</Button>

						<Button
							size='icon'
							variant='ghost'
							className='playback-control size-10 rounded-full text-zinc-200 hover:text-white'
							onClick={playPrevious}
							disabled={!currentSong}
						>
							<SkipBack className='h-4 w-4' />
						</Button>

						<Button
							size='icon'
							className='playback-control-primary h-12 w-12 rounded-full text-black transition-transform hover:scale-[1.03]'
							onClick={togglePlay}
							disabled={!currentSong}
						>
							{isPlaying ? <Pause className='h-5 w-5' /> : <Play className='h-5 w-5' />}
						</Button>
						<Button
							size='icon'
							variant='ghost'
							className='playback-control size-10 rounded-full text-zinc-200 hover:text-white'
							onClick={playNext}
							disabled={!currentSong}
						>
							<SkipForward className='h-4 w-4' />
						</Button>
						<Button
							size='icon'
							variant='ghost'
							className={cn(
								"relative hidden size-10 rounded-full text-zinc-200 hover:text-white sm:inline-flex",
								repeatMode === "off" ? "playback-control" : "accent-bg text-black shadow-lg shadow-black/20"
							)}
							onClick={cycleRepeatMode}
						>
							<Repeat className='h-4 w-4' />
							{repeatMode === "one" && (
								<span className='absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] font-semibold text-white'>
									1
								</span>
							)}
						</Button>
					</div>

					<div className='hidden sm:flex items-center gap-2 w-full'>
						<div className='text-xs text-zinc-400'>{formatTime(currentTime)}</div>
						<Slider
							value={[currentTime]}
							max={duration || 100}
							step={1}
							className='w-full hover:cursor-grab active:cursor-grabbing'
							onValueChange={handleSeek}
						/>
						<div className='text-xs text-zinc-400'>{formatTime(duration)}</div>
					</div>
				</div>
				{/* volume controls */}
				<div className='hidden sm:flex items-center gap-4 min-w-[180px] w-[30%] justify-end'>
					

					<div className='flex items-center gap-2 rounded-full border border-white/10 bg-black/10 px-2 py-1.5'>
						<Button size='icon' variant='ghost' className='playback-control size-9 rounded-full text-zinc-200 hover:text-white'>
							<Volume1 className='h-4 w-4' />
						</Button>

						<Slider
							value={[volume]}
							max={100}
							step={1}
							className='w-24 hover:cursor-grab active:cursor-grabbing'
							onValueChange={(value) => {
								setVolume(value[0]);
								if (audioRef.current) {
									audioRef.current.volume = value[0] / 100;
								}
							}}
						/>
					</div>
				</div>
			</div>
		</footer>
	);
};
