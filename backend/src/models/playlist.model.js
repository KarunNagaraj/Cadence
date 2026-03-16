import mongoose from "mongoose";

const playlistSongSchema = new mongoose.Schema(
	{
		_id: {
			type: String,
			required: true,
		},
		title: {
			type: String,
			required: true,
			trim: true,
		},
		artist: {
			type: String,
			required: true,
			trim: true,
		},
		albumId: {
			type: String,
			default: null,
		},
		imageUrl: {
			type: String,
			required: true,
			trim: true,
		},
		audioUrl: {
			type: String,
			required: true,
			trim: true,
		},
		duration: {
			type: Number,
			required: true,
			min: 0,
		},
		createdAt: {
			type: String,
			default: () => new Date().toISOString(),
		},
		updatedAt: {
			type: String,
			default: () => new Date().toISOString(),
		},
	},
	{ _id: false }
);

const playlistSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			maxlength: 60,
		},
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		songs: {
			type: [playlistSongSchema],
			default: [],
		},
	},
	{ timestamps: true }
);

playlistSchema.index({ owner: 1, updatedAt: -1 });

export const Playlist = mongoose.model("Playlist", playlistSchema);
