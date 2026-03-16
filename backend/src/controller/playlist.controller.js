import { clerkClient } from "@clerk/express";
import { Playlist } from "../models/playlist.model.js";
import { User } from "../models/user.model.js";

const DEFAULT_PLAYLIST_NAME = "New Playlist";

const getPlaylistName = (value) => {
	const trimmedName = String(value ?? "").trim();
	return trimmedName ? trimmedName.slice(0, 60) : DEFAULT_PLAYLIST_NAME;
};

const getCurrentUser = async (clerkId) => {
	return User.findOne({ clerkId });
};

const getUserFromClerk = async (clerkId) => {
	const clerkUser = await clerkClient.users.getUser(clerkId);
	const firstName = clerkUser.firstName ?? "";
	const lastName = clerkUser.lastName ?? "";

	return {
		clerkId,
		fullName: `${firstName} ${lastName}`.trim() || "New User",
		imageUrl: clerkUser.imageUrl || "https://via.placeholder.com/256",
	};
};

const getPlaylistForOwner = async (playlistId, ownerId) => {
	return Playlist.findOne({ _id: playlistId, owner: ownerId });
};

const getNormalizedTimestamp = (value) => {
	if (typeof value === "string" && value.trim() !== "") {
		return value;
	}

	return new Date().toISOString();
};

const validateSongPayload = (song) => {
	if (!song || typeof song !== "object") {
		return "Song payload is required";
	}

	const requiredStringFields = ["_id", "title", "artist", "imageUrl", "audioUrl"];
	for (const field of requiredStringFields) {
		if (typeof song[field] !== "string" || song[field].trim() === "") {
			return `Song field "${field}" is required`;
		}
	}

	for (const field of ["createdAt", "updatedAt"]) {
		if (song[field] !== undefined && song[field] !== null && typeof song[field] !== "string") {
			return `Song field "${field}" must be a string when provided`;
		}
	}

	if (song.albumId !== null && song.albumId !== undefined && typeof song.albumId !== "string") {
		return 'Song field "albumId" must be a string or null';
	}

	if (typeof song.duration !== "number" || Number.isNaN(song.duration) || song.duration < 0) {
		return 'Song field "duration" must be a valid non-negative number';
	}

	return null;
};

const normalizeSongPayload = (song) => ({
	_id: song._id.trim(),
	title: song.title.trim(),
	artist: song.artist.trim(),
	albumId: typeof song.albumId === "string" ? song.albumId : null,
	imageUrl: song.imageUrl.trim(),
	audioUrl: song.audioUrl.trim(),
	duration: song.duration,
	createdAt: getNormalizedTimestamp(song.createdAt),
	updatedAt: getNormalizedTimestamp(song.updatedAt),
});

const requireCurrentUser = async (req, res) => {
	let user = await getCurrentUser(req.auth.userId);

	if (!user) {
		const clerkUserPayload = await getUserFromClerk(req.auth.userId);
		user = await User.findOneAndUpdate(
			{ clerkId: req.auth.userId },
			clerkUserPayload,
			{
				upsert: true,
				new: true,
				setDefaultsOnInsert: true,
			}
		);
	}

	if (!user) {
		res.status(404).json({ message: "User profile not found" });
		return null;
	}

	return user;
};

export const getPlaylists = async (req, res, next) => {
	try {
		const user = await requireCurrentUser(req, res);
		if (!user) return;

		const playlists = await Playlist.find({ owner: user._id }).sort({ updatedAt: -1 });
		res.status(200).json(playlists);
	} catch (error) {
		next(error);
	}
};

export const createPlaylist = async (req, res, next) => {
	try {
		const user = await requireCurrentUser(req, res);
		if (!user) return;

		const playlist = await Playlist.create({
			name: getPlaylistName(req.body?.name),
			owner: user._id,
			songs: [],
		});

		res.status(201).json(playlist);
	} catch (error) {
		next(error);
	}
};

export const renamePlaylist = async (req, res, next) => {
	try {
		const user = await requireCurrentUser(req, res);
		if (!user) return;

		const playlist = await Playlist.findOneAndUpdate(
			{ _id: req.params.playlistId, owner: user._id },
			{ name: getPlaylistName(req.body?.name) },
			{ new: true, runValidators: true }
		);

		if (!playlist) {
			return res.status(404).json({ message: "Playlist not found" });
		}

		res.status(200).json(playlist);
	} catch (error) {
		next(error);
	}
};

export const deletePlaylist = async (req, res, next) => {
	try {
		const user = await requireCurrentUser(req, res);
		if (!user) return;

		const playlist = await Playlist.findOneAndDelete({
			_id: req.params.playlistId,
			owner: user._id,
		});

		if (!playlist) {
			return res.status(404).json({ message: "Playlist not found" });
		}

		res.status(200).json({ success: true });
	} catch (error) {
		next(error);
	}
};

export const addSongToPlaylist = async (req, res, next) => {
	try {
		const user = await requireCurrentUser(req, res);
		if (!user) return;

		const validationError = validateSongPayload(req.body?.song);
		if (validationError) {
			return res.status(400).json({ message: validationError });
		}

		const playlist = await getPlaylistForOwner(req.params.playlistId, user._id);
		if (!playlist) {
			return res.status(404).json({ message: "Playlist not found" });
		}

		const song = normalizeSongPayload(req.body.song);
		const alreadyExists = playlist.songs.some((existingSong) => existingSong._id === song._id);

		if (!alreadyExists) {
			playlist.songs.push(song);
			await playlist.save();
		}

		res.status(200).json({ playlist, added: !alreadyExists });
	} catch (error) {
		next(error);
	}
};

export const removeSongFromPlaylist = async (req, res, next) => {
	try {
		const user = await requireCurrentUser(req, res);
		if (!user) return;

		const playlist = await getPlaylistForOwner(req.params.playlistId, user._id);
		if (!playlist) {
			return res.status(404).json({ message: "Playlist not found" });
		}

		playlist.songs = playlist.songs.filter((song) => song._id !== req.params.songId);
		await playlist.save();

		res.status(200).json(playlist);
	} catch (error) {
		next(error);
	}
};
