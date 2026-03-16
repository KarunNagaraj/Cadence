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
		} catch (error: any) {
			toast.error(error?.response?.data?.message ?? error?.message ?? "Failed to create playlist");
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
						className='text-zinc-400 hover:bg-zinc-800 hover:text-white'
						aria-label='Create playlist'
						disabled={isSaving}
					>
						<Plus className='size-4' />
					</Button>
				) : (
					<Button className='w-full bg-white text-black hover:bg-zinc-200' disabled={isSaving}>
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
						className='border-zinc-800 bg-transparent'
						disabled={isSaving}
					>
						Cancel
					</Button>
					<Button onClick={handleCreatePlaylist} className='bg-green-500 text-black hover:bg-green-400' disabled={isSaving}>
						{isSaving ? "Creating..." : "Create"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default AddPlaylistDialog;
