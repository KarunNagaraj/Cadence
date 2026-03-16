import { setAuthTokenGetter } from "@/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { usePlaylistStore } from "@/stores/usePlaylistStore";
import { useAuth } from "@clerk/clerk-react";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const { getToken, userId } = useAuth();
	const [loading, setLoading] = useState(true);
	const { checkAdminStatus, reset: resetAuth } = useAuthStore();
	const { initSocket, disconnectSocket } = useChatStore();
	const { fetchPlaylists, migrateLegacyPlaylists, reset: resetPlaylists } = usePlaylistStore();

	useEffect(() => {
		setAuthTokenGetter(() => getToken());

		const initAuth = async () => {
			try {
				const token = await getToken();
				if (token && userId) {
					await checkAdminStatus();
					await fetchPlaylists();
					await migrateLegacyPlaylists();
					initSocket(userId);
				} else {
					resetAuth();
					resetPlaylists();
				}
			} catch (error: any) {
				console.log("Error in auth provider", error);
			} finally {
				setLoading(false);
			}
		};

		initAuth();

		// clean up
		return () => {
			setAuthTokenGetter(null);
			disconnectSocket();
			resetPlaylists();
		};
	}, [getToken, userId, checkAdminStatus, resetAuth, fetchPlaylists, migrateLegacyPlaylists, initSocket, disconnectSocket, resetPlaylists]);

	if (loading)
		return (
			<div className='h-screen w-full flex items-center justify-center'>
				<Loader className='size-8 text-red-500 animate-spin' />
			</div>
		);

	return <>{children}</>;
};
export default AuthProvider;
