import { create } from "zustand";
import type { Song } from "@/types";

export type RepeatMode = "off" | "all" | "one";

const getSongIndex = (songs: Song[], song: Song | null) => {
	if (!song) return -1;

	return songs.findIndex((item) => item._id === song._id);
};

const createShuffledQueue = (songs: Song[], pinnedSong: Song | null) => {
	const shuffledSongs = [...songs];
	const pinnedSongIndex = getSongIndex(shuffledSongs, pinnedSong);

	let prioritizedSong: Song | null = null;

	if (pinnedSongIndex !== -1) {
		prioritizedSong = shuffledSongs.splice(pinnedSongIndex, 1)[0];
	}

	for (let index = shuffledSongs.length - 1; index > 0; index -= 1) {
		const randomIndex = Math.floor(Math.random() * (index + 1));
		[shuffledSongs[index], shuffledSongs[randomIndex]] = [shuffledSongs[randomIndex], shuffledSongs[index]];
	}

	return prioritizedSong ? [prioritizedSong, ...shuffledSongs] : shuffledSongs;
};

interface PlayerStore {
	currentSong: Song | null;
	isPlaying: boolean;
	queue: Song[];
	originalQueue: Song[];
	currentIndex: number;
	isShuffleEnabled: boolean;
	repeatMode: RepeatMode;

	initializeQueue: (songs: Song[]) => void;
	playAlbum: (songs: Song[], startIndex?: number) => void;
	setCurrentSong: (song: Song | null) => void;
	togglePlay: () => void;
	playNext: () => void;
	playPrevious: () => void;
	toggleShuffle: () => void;
	cycleRepeatMode: () => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
	currentSong: null,
	isPlaying: false,
	queue: [],
	originalQueue: [],
	currentIndex: -1,
	isShuffleEnabled: false,
	repeatMode: "off",

	initializeQueue: (songs: Song[]) => {
		const { currentSong, currentIndex, isShuffleEnabled } = get();
		const nextQueue = isShuffleEnabled ? createShuffledQueue(songs, currentSong) : songs;
		const nextIndex = currentSong ? getSongIndex(nextQueue, currentSong) : currentIndex === -1 ? 0 : currentIndex;

		set({
			originalQueue: songs,
			queue: nextQueue,
			currentSong: currentSong || songs[0] || null,
			currentIndex: nextIndex,
		});
	},

	playAlbum: (songs: Song[], startIndex = 0) => {
		if (songs.length === 0) return;

		const song = songs[startIndex];
		const { isShuffleEnabled } = get();
		const nextQueue = isShuffleEnabled ? createShuffledQueue(songs, song) : songs;
		const nextIndex = getSongIndex(nextQueue, song);

		set({
			originalQueue: songs,
			queue: nextQueue,
			currentSong: song,
			currentIndex: nextIndex === -1 ? startIndex : nextIndex,
			isPlaying: true,
		});
	},

	setCurrentSong: (song: Song | null) => {
		if (!song) return;

		const songIndex = get().queue.findIndex((s) => s._id === song._id);
		set({
			currentSong: song,
			isPlaying: true,
			currentIndex: songIndex !== -1 ? songIndex : get().currentIndex,
		});
	},

	togglePlay: () => {
		const willStartPlaying = !get().isPlaying;

		set({
			isPlaying: willStartPlaying,
		});
	},

	playNext: () => {
		const { currentIndex, queue, repeatMode } = get();
		if (queue.length === 0) return;

		const nextIndex =
			currentIndex + 1 < queue.length ? currentIndex + 1 : repeatMode === "all" ? 0 : -1;

		if (nextIndex === -1) {
			set({ isPlaying: false });
			return;
		}

		set({
			currentSong: queue[nextIndex],
			currentIndex: nextIndex,
			isPlaying: true,
		});
	},
	playPrevious: () => {
		const { currentIndex, queue, repeatMode } = get();
		if (queue.length === 0) return;

		const previousIndex =
			currentIndex - 1 >= 0 ? currentIndex - 1 : repeatMode === "all" ? queue.length - 1 : -1;

		if (previousIndex === -1) {
			set({ isPlaying: false });
			return;
		}

		set({
			currentSong: queue[previousIndex],
			currentIndex: previousIndex,
			isPlaying: true,
		});
	},
	toggleShuffle: () => {
		const { isShuffleEnabled, currentSong, originalQueue, queue } = get();
		const nextShuffleState = !isShuffleEnabled;
		const sourceQueue = originalQueue.length > 0 ? originalQueue : queue;

		if (sourceQueue.length === 0) {
			set({ isShuffleEnabled: nextShuffleState });
			return;
		}

		const nextQueue = nextShuffleState ? createShuffledQueue(sourceQueue, currentSong) : [...sourceQueue];
		const nextIndex = getSongIndex(nextQueue, currentSong);

		set({
			isShuffleEnabled: nextShuffleState,
			queue: nextQueue,
			currentIndex: nextIndex,
		});
	},
	cycleRepeatMode: () => {
		const nextRepeatMode: Record<RepeatMode, RepeatMode> = {
			off: "all",
			all: "one",
			one: "off",
		};

		set(({ repeatMode }) => ({
			repeatMode: nextRepeatMode[repeatMode],
		}));
	},
}));
