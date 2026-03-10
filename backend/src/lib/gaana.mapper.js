const collectTracksRecursively = (payload, depth = 0, tracks = []) => {
	if (depth > 5 || payload === null || payload === undefined) return tracks;

	if (Array.isArray(payload)) {
		for (const item of payload) {
			collectTracksRecursively(item, depth + 1, tracks);
		}
		return tracks;
	}

	if (typeof payload !== "object") return tracks;

	// Gaana songs expose track_id, while albums generally do not.
	if (payload.track_id) tracks.push(payload);

	for (const value of Object.values(payload)) {
		if (value && typeof value === "object") {
			collectTracksRecursively(value, depth + 1, tracks);
		}
	}

	return tracks;
};

const toDuration = (value) => {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : 0;
};

export const normalizeGaanaTrack = (track) => {
	if (!track || typeof track !== "object") return null;
	if (!track.track_id) return null;

	const imageUrls = track.images?.urls ?? {};
	const streamUrls = track.stream_urls?.urls ?? {};

	return {
		_id: String(track.track_id),
		title: track.title ?? "Unknown title",
		artist: track.artists ?? "Unknown artist",
		imageUrl: imageUrls.large_artwork ?? imageUrls.medium_artwork ?? imageUrls.small_artwork ?? track.artist_image ?? "",
		audioUrl:
			streamUrls.high_quality ??
			streamUrls.very_high_quality ??
			streamUrls.medium_quality ??
			streamUrls.low_quality ??
			"",
		duration: toDuration(track.duration),
		albumId: track.album_seokey ?? null,
	};
};

export const normalizeGaanaTrackList = (payload) => {
	const tracks = collectTracksRecursively(payload);
	return tracks
		.map(normalizeGaanaTrack)
		.filter((track) => track && track._id);
};
