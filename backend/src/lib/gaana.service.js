import axios from "axios";
import { normalizeGaanaTrackList } from "./gaana.mapper.js";

class ExternalApiError extends Error {
	constructor(statusCode, message) {
		super(message);
		this.name = "ExternalApiError";
		this.statusCode = statusCode;
	}
}

const getGaanaApiUrl = () => {
	const apiUrl = process.env.GAANA_API_URL;
	if (!apiUrl) {
		throw new ExternalApiError(500, "GAANA_API_URL is not configured");
	}
	return apiUrl;
};

const gaanaClient = axios.create({
	timeout: 12000,
});

const toErrorMessage = (value, fallbackMessage) => {
	if (typeof value === "string" && value.trim()) return value;

	if (Array.isArray(value) && value.length > 0) {
		const joined = value
			.map((item) => toErrorMessage(item, ""))
			.filter(Boolean)
			.join(", ");

		return joined || fallbackMessage;
	}

	if (value && typeof value === "object") {
		const nestedMessage =
			value.message ?? value.detail ?? value.error ?? value.reason ?? Object.values(value)[0];

		if (nestedMessage !== undefined) {
			return toErrorMessage(nestedMessage, fallbackMessage);
		}
	}

	return fallbackMessage;
};

const mapAxiosError = (error, fallbackMessage) => {
	if (axios.isAxiosError(error)) {
		const statusCode = error.response?.status ?? 502;
		const upstreamMessage = toErrorMessage(
			error.response?.data?.detail ?? error.response?.data?.message ?? error.response?.data,
			fallbackMessage
		);

		return new ExternalApiError(statusCode, upstreamMessage);
	}
	return error;
};

const fetchFromGaana = async (url, params, fallbackMessage) => {
	try {
		const response = await gaanaClient.get(url, {
			baseURL: getGaanaApiUrl(),
			params,
		});
		return response.data;
	} catch (error) {
		throw mapAxiosError(error, fallbackMessage);
	}
};

const dedupeTracks = (tracks) => {
	const uniqueTracks = new Map();

	for (const track of tracks) {
		if (!track?._id) continue;
		uniqueTracks.set(track._id, track);
	}

	return Array.from(uniqueTracks.values());
};

const shuffleTracks = (tracks) => {
	const shuffled = [...tracks];

	for (let index = shuffled.length - 1; index > 0; index -= 1) {
		const swapIndex = Math.floor(Math.random() * (index + 1));
		[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
	}

	return shuffled;
};

export const searchSongsFromGaana = async ({ query, limit }) => {
	const payload = await fetchFromGaana(
		"/songs/search",
		{ query, limit },
		"Failed to fetch songs from Gaana"
	);

	return normalizeGaanaTrackList(payload);
};

export const getTrendingSongsFromGaana = async ({ lang }) => {
	const payload = await fetchFromGaana("/trending", { language: lang }, "Failed to fetch trending songs from Gaana");
	return normalizeGaanaTrackList(payload);
};

export const getNewReleaseSongsFromGaana = async ({ lang }) => {
	const payload = await fetchFromGaana("/newreleases", { language: lang }, "Failed to fetch new releases from Gaana");
	return normalizeGaanaTrackList(payload);
};

export const getAlbumSongsFromGaana = async ({ seokey }) => {
	const payload = await fetchFromGaana("/albums/info", { seokey }, "Failed to fetch album details from Gaana");
	const songs = normalizeGaanaTrackList(payload);

	return {
		albumId: seokey,
		songs,
	};
};

export const getRandomSongsFromGaana = async ({ lang = "English", limit = 20 }) => {
	const searchTerms = shuffleTracks([
		"top songs",
		"love",
		"party",
		"hits",
		"romantic",
		"indie",
		"dance",
		"pop",
	]).slice(0, 3);

	const sources = await Promise.allSettled([
		fetchFromGaana("/trending", { language: lang }, "Failed to fetch trending songs from Gaana"),
		fetchFromGaana("/newreleases", { language: lang }, "Failed to fetch new releases from Gaana"),
		...searchTerms.map((query) =>
			fetchFromGaana("/songs/search", { query, limit: 20 }, "Failed to fetch random songs from Gaana")
		),
	]);

	const tracks = dedupeTracks(
		sources
			.filter((result) => result.status === "fulfilled")
			.flatMap((result) => normalizeGaanaTrackList(result.value))
	);

	return shuffleTracks(tracks).slice(0, limit);
};

export { ExternalApiError };
