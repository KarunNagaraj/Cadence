import {
	ExternalApiError,
	getAlbumSongsFromGaana,
	getNewReleaseSongsFromGaana,
	getTrendingSongsFromGaana,
	searchSongsFromGaana,
} from "../lib/gaana.service.js";

import { getRandomSongsFromGaana } from "../lib/gaana.service.js";

export const getExternalRandomSongs = async (req, res, next) => {
	try {
		const limit = parseLimit(req.query.limit, 15);
		const lang = String(req.query.lang ?? req.query.language ?? "English").trim() || "English";

		const songs = await getRandomSongsFromGaana({ lang, limit });

		return res.status(200).json(songs);

	} catch (error) {
		return handleExternalError(error, res, next);
	}
};
const parseLimit = (value, defaultLimit = 20) => {
	const parsed = Number.parseInt(value, 10);
	if (Number.isNaN(parsed)) return defaultLimit;
	return Math.min(Math.max(parsed, 1), 50);
};

const handleExternalError = (error, res, next) => {
	if (error instanceof ExternalApiError) {
		return res.status(error.statusCode).json({ message: error.message });
	}
	return next(error);
};

export const searchExternalSongs = async (req, res, next) => {
	try {
		const query = String(req.query.query ?? "").trim();
		if (!query) return res.status(400).json({ message: "Query is required" });

		const limit = parseLimit(req.query.limit);
		const songs = await searchSongsFromGaana({ query, limit });
		return res.status(200).json(songs);
	} catch (error) {
		return handleExternalError(error, res, next);
	}
};

export const getExternalTrendingSongs = async (req, res, next) => {
	try {
		const lang = String(req.query.lang ?? req.query.language ?? "Hindi").trim() || "Hindi";
		const songs = await getTrendingSongsFromGaana({ lang });
		return res.status(200).json(songs);
	} catch (error) {
		return handleExternalError(error, res, next);
	}
};

export const getExternalNewReleases = async (req, res, next) => {
	try {
		const lang = String(req.query.lang ?? req.query.language ?? "Hindi").trim() || "Hindi";
		const limit = parseLimit(req.query.limit, 6);
		const songs = await getNewReleaseSongsFromGaana({ lang });
		if (songs.length > 0) return res.status(200).json(songs.slice(0, limit));

		const fallbackSongs = await getTrendingSongsFromGaana({ lang });
		return res.status(200).json(fallbackSongs.slice(0, limit));
	} catch (error) {
		return handleExternalError(error, res, next);
	}
};

export const getExternalAlbumSongs = async (req, res, next) => {
	try {
		const seokey = String(req.params.seokey ?? "").trim();
		if (!seokey) return res.status(400).json({ message: "Album seokey is required" });

		const album = await getAlbumSongsFromGaana({ seokey });
		return res.status(200).json(album);
	} catch (error) {
		return handleExternalError(error, res, next);
	}
};
