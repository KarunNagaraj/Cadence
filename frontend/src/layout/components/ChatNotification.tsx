import { useEffect } from "react";
import { useChatStore } from "@/stores/useChatStore";

const ChatNotification = () => {
	const chatNotification = useChatStore((state) => state.chatNotification);
	const clearChatNotification = useChatStore((state) => state.clearChatNotification);

	useEffect(() => {
		if (!chatNotification) return;

		const timer = window.setTimeout(() => {
			clearChatNotification();
		}, 3000);

		return () => window.clearTimeout(timer);
	}, [chatNotification, clearChatNotification]);

	if (!chatNotification) return null;

	return (
		<div className='pointer-events-none fixed left-1/2 top-4 z-50 w-[min(90vw,28rem)] -translate-x-1/2'>
			<div
				className={`rounded-2xl border px-4 py-3 text-sm font-medium text-white shadow-xl backdrop-blur-xl ${
					chatNotification.type === "error"
						? "border-red-400/40 bg-red-950/75"
						: chatNotification.type === "info"
							? "border-sky-400/40 bg-slate-950/75"
						: "border-white/15 bg-black/65"
				}`}
			>
				{chatNotification.message}
			</div>
		</div>
	);
};

export default ChatNotification;
