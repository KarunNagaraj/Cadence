
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useChatStore } from "@/stores/useChatStore";
import { useUser } from "@clerk/clerk-react";
import { useEffect, useRef } from "react";

const AudioPlayer = () => {
	const audioRef = useRef<HTMLAudioElement>(null);
	const prevSongRef = useRef<string | null>(null);

	const { currentSong, isPlaying, playNext } = usePlayerStore();
	const { socket, isConnected } = useChatStore();
	const { user } = useUser();

	// handle play/pause logic
	useEffect(() => {
		if (isPlaying) audioRef.current?.play();
		else audioRef.current?.pause();
	}, [isPlaying]);

	// handle song ends
	useEffect(() => {
		const audio = audioRef.current;

		const handleEnded = () => {
			playNext();
		};

		audio?.addEventListener("ended", handleEnded);

		return () => audio?.removeEventListener("ended", handleEnded);
	}, [playNext]);

	// handle song changes
	useEffect(() => {
		if (!audioRef.current || !currentSong) return;

		const audio = audioRef.current;

		// check if this is actually a new song
		const isSongChange = prevSongRef.current !== currentSong?.audioUrl;
		if (isSongChange) {
			audio.src = currentSong?.audioUrl;
			// reset the playback position
			audio.currentTime = 0;

			prevSongRef.current = currentSong?.audioUrl;

			if (isPlaying) audio.play();
		}
	}, [currentSong, isPlaying]);

	// broadcast current listening activity to friends
	useEffect(() => {
		if (!user?.id || !isConnected || !socket) return;

		const activity =
			isPlaying && currentSong
				? `Playing ${currentSong.title} by ${currentSong.artist}`
				: "Idle";

		socket.emit("update_activity", { userId: user.id, activity });
	}, [user?.id, isConnected, socket, isPlaying, currentSong]);

	return <audio ref={audioRef} />;
};
export default AudioPlayer;
