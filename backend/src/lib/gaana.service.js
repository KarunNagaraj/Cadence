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

const mapAxiosError = (error, fallbackMessage) => {
	if (axios.isAxiosError(error)) {
		const statusCode = error.response?.status ?? 502;
		const upstreamMessage =
			error.response?.data?.detail ?? error.response?.data?.message ?? fallbackMessage;

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

export { ExternalApiError };
