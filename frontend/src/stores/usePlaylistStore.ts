import { axiosInstance } from "@/lib/axios";
import type { Playlist, Song } from "@/types";
import { create } from "zustand";

interface PlaylistStore {
	playlists: Playlist[];
	isLoading: boolean;
	isSaving: boolean;
	hasLoaded: boolean;
	error: string | null;
	fetchPlaylists: () => Promise<void>;
	migrateLegacyPlaylists: () => Promise<void>;
	createPlaylist: (name?: string) => Promise<Playlist>;
	renamePlaylist: (playlistId: string, name: string) => Promise<Playlist>;
	deletePlaylist: (playlistId: string) => Promise<void>;
	addSongToPlaylist: (playlistId: string, song: Song) => Promise<boolean>;
	removeSongFromPlaylist: (playlistId: string, songId: string) => Promise<void>;
	reset: () => void;
}

const DEFAULT_PLAYLIST_NAME = "New Playlist";
const LEGACY_STORAGE_KEY = "cadence-playlists";

const getPlaylistName = (name?: string) => {
	const trimmedName = name?.trim();
	return trimmedName ? trimmedName : DEFAULT_PLAYLIST_NAME;
};

const getErrorMessage = (error: any) => error?.response?.data?.message ?? error?.message ?? "Something went wrong";

const upsertPlaylist = (playlists: Playlist[], playlist: Playlist) => [
	playlist,
	...playlists.filter((existingPlaylist) => existingPlaylist._id !== playlist._id),
];

const readLegacyPlaylists = (): Playlist[] => {
	if (typeof window === "undefined") return [];

	try {
		const rawValue = window.localStorage.getItem(LEGACY_STORAGE_KEY);
		if (!rawValue) return [];

		const parsedValue = JSON.parse(rawValue);
		return Array.isArray(parsedValue?.state?.playlists) ? parsedValue.state.playlists : [];
	} catch {
		return [];
	}
};

const clearLegacyPlaylists = () => {
	if (typeof window === "undefined") return;
	window.localStorage.removeItem(LEGACY_STORAGE_KEY);
};

const initialState = {
	playlists: [] as Playlist[],
	isLoading: false,
	isSaving: false,
	hasLoaded: false,
	error: null as string | null,
};

export const usePlaylistStore = create<PlaylistStore>((set) => ({
	...initialState,

	fetchPlaylists: async () => {
		set({ isLoading: true, error: null });

		try {
			const response = await axiosInstance.get("/playlists");
			set({
				playlists: response.data,
				isLoading: false,
				hasLoaded: true,
				error: null,
			});
		} catch (error: any) {
			set({
				playlists: [],
				isLoading: false,
				hasLoaded: true,
				error: getErrorMessage(error),
			});
			throw error;
		}
	},

	migrateLegacyPlaylists: async () => {
		const legacyPlaylists = readLegacyPlaylists();
		if (legacyPlaylists.length === 0) return;

		set({ isSaving: true, error: null });

		try {
			const migratedPlaylists: Playlist[] = [];

			for (const legacyPlaylist of legacyPlaylists) {
				const createResponse = await axiosInstance.post("/playlists", {
					name: getPlaylistName(legacyPlaylist.name),
				});

				let migratedPlaylist = createResponse.data as Playlist;

				for (const song of legacyPlaylist.songs ?? []) {
					const addSongResponse = await axiosInstance.post(`/playlists/${migratedPlaylist._id}/songs`, { song });
					migratedPlaylist = addSongResponse.data.playlist as Playlist;
				}

				migratedPlaylists.push(migratedPlaylist);
			}

			clearLegacyPlaylists();

			set((state) => ({
				playlists: [...migratedPlaylists, ...state.playlists],
				isSaving: false,
				hasLoaded: true,
				error: null,
			}));
		} catch (error: any) {
			set({ isSaving: false, error: getErrorMessage(error) });
			throw error;
		}
	},

	createPlaylist: async (name) => {
		set({ isSaving: true, error: null });

		try {
			const response = await axiosInstance.post("/playlists", {
				name: getPlaylistName(name),
			});
			const playlist = response.data as Playlist;

			set((state) => ({
				playlists: upsertPlaylist(state.playlists, playlist),
				isSaving: false,
				hasLoaded: true,
				error: null,
			}));

			return playlist;
		} catch (error: any) {
			set({ isSaving: false, error: getErrorMessage(error) });
			throw error;
		}
	},

	renamePlaylist: async (playlistId, name) => {
		set({ isSaving: true, error: null });

		try {
			const response = await axiosInstance.patch(`/playlists/${playlistId}`, {
				name: getPlaylistName(name),
			});
			const playlist = response.data as Playlist;

			set((state) => ({
				playlists: upsertPlaylist(state.playlists, playlist),
				isSaving: false,
				error: null,
			}));

			return playlist;
		} catch (error: any) {
			set({ isSaving: false, error: getErrorMessage(error) });
			throw error;
		}
	},

	deletePlaylist: async (playlistId) => {
		set({ isSaving: true, error: null });

		try {
			await axiosInstance.delete(`/playlists/${playlistId}`);
			set((state) => ({
				playlists: state.playlists.filter((playlist) => playlist._id !== playlistId),
				isSaving: false,
				error: null,
			}));
		} catch (error: any) {
			set({ isSaving: false, error: getErrorMessage(error) });
			throw error;
		}
	},

	addSongToPlaylist: async (playlistId, song) => {
		set({ isSaving: true, error: null });

		try {
			const response = await axiosInstance.post(`/playlists/${playlistId}/songs`, { song });
			const { playlist, added } = response.data as { playlist: Playlist; added: boolean };

			set((state) => ({
				playlists: upsertPlaylist(state.playlists, playlist),
				isSaving: false,
				error: null,
			}));

			return added;
		} catch (error: any) {
			set({ isSaving: false, error: getErrorMessage(error) });
			throw error;
		}
	},

	removeSongFromPlaylist: async (playlistId, songId) => {
		set({ isSaving: true, error: null });

		try {
			const response = await axiosInstance.delete(`/playlists/${playlistId}/songs/${songId}`);
			const playlist = response.data as Playlist;

			set((state) => ({
				playlists: upsertPlaylist(state.playlists, playlist),
				isSaving: false,
				error: null,
			}));
		} catch (error: any) {
			set({ isSaving: false, error: getErrorMessage(error) });
			throw error;
		}
	},

	reset: () => set(initialState),
}));
