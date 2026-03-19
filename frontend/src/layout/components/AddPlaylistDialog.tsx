import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { usePlaylistStore } from "@/stores/usePlaylistStore";
import { Plus } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

type AddPlaylistDialogProps = {
	compact?: boolean;
};

const getErrorMessage = (error: unknown, fallback: string) => {
	if (typeof error === "object" && error !== null) {
		const maybeError = error as {
			response?: { data?: { message?: string } };
			message?: string;
		};

		return maybeError.response?.data?.message ?? maybeError.message ?? fallback;
	}

	return fallback;
};

const AddPlaylistDialog = ({ compact = false }: AddPlaylistDialogProps) => {
	const navigate = useNavigate();
	const createPlaylist = usePlaylistStore((state) => state.createPlaylist);
	const isSaving = usePlaylistStore((state) => state.isSaving);
	const [isOpen, setIsOpen] = useState(false);
	const [name, setName] = useState("");

	const handleCreatePlaylist = async () => {
		try {
			const playlist = await createPlaylist(name);
			setName("");
			setIsOpen(false);
			navigate(`/playlists/${playlist._id}`);
		} catch (error: unknown) {
			toast.error(getErrorMessage(error, "Failed to create playlist"));
		}
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				setIsOpen(open);
				if (!open) setName("");
			}}
		>
			<DialogTrigger asChild>
				{compact ? (
					<Button
						variant='ghost'
						size='icon'
						className='accent-text hover:bg-white/10 hover:text-white'
						aria-label='Create playlist'
						disabled={isSaving}
					>
						<Plus className='size-4' />
					</Button>
				) : (
					<Button className='w-full accent-glow' disabled={isSaving}>
						<Plus className='mr-2 size-4' />
						Create Playlist
					</Button>
				)}
			</DialogTrigger>

			<DialogContent className='border-zinc-800 bg-zinc-950 text-white'>
				<DialogHeader>
					<DialogTitle>Create Playlist</DialogTitle>
					<DialogDescription className='text-zinc-400'>
						Start with an empty playlist. The first song you add becomes the cover art.
					</DialogDescription>
				</DialogHeader>

				<div className='space-y-2 py-2'>
					<label className='text-sm font-medium text-zinc-200'>Playlist name</label>
					<Input
						value={name}
						onChange={(event) => setName(event.target.value)}
						placeholder='New Playlist'
						className='border-zinc-800 bg-zinc-900'
						maxLength={60}
						disabled={isSaving}
					/>
				</div>

				<DialogFooter>
					<Button
						variant='outline'
						onClick={() => setIsOpen(false)}
						className='border-white/10 bg-transparent text-white hover:bg-white/10'
						disabled={isSaving}
					>
						Cancel
					</Button>
					<Button onClick={handleCreatePlaylist} className='accent-glow' disabled={isSaving}>
						{isSaving ? "Creating..." : "Create"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default AddPlaylistDialog;
