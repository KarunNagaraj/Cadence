import { Router } from "express";
import {
	getExternalAlbumSongs,
	getExternalNewReleases,
	getExternalTrendingSongs,
	searchExternalSongs,
	getExternalRandomSongs
} from "../controller/external.controller.js";

const router = Router();

router.get("/search", searchExternalSongs);
router.get("/trending", getExternalTrendingSongs);
router.get("/new-releases", getExternalNewReleases);
router.get("/album/:seokey", getExternalAlbumSongs);
router.get("/random", getExternalRandomSongs);

export default router;
