import { Song } from "../models/song.model.js";
import { Album } from "../models/album.model.js";

export const checkAdmin = async (req, res, next) => {
	res.status(200).json({ isAdmin: true });
};