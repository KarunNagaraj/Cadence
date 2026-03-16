import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
	addSongToPlaylist,
	createPlaylist,
	deletePlaylist,
	getPlaylists,
	removeSongFromPlaylist,
	renamePlaylist,
} from "../controller/playlist.controller.js";

const router = Router();

router.get("/", protectRoute, getPlaylists);
router.post("/", protectRoute, createPlaylist);
router.patch("/:playlistId", protectRoute, renamePlaylist);
router.delete("/:playlistId", protectRoute, deletePlaylist);
router.post("/:playlistId/songs", protectRoute, addSongToPlaylist);
router.delete("/:playlistId/songs/:songId", protectRoute, removeSongFromPlaylist);

export default router;
