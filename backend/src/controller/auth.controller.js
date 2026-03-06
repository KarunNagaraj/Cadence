import { User } from "../models/user.model.js";

export const authCallback = async (req, res, next) => {
	try {
		const { id, firstName, lastName, imageUrl } = req.body;
		const fullName = `${firstName || ""} ${lastName || ""}`.trim() || "New User";
		const safeImageUrl = imageUrl || "https://via.placeholder.com/256";

		await User.findOneAndUpdate(
			{ clerkId: id },
			{
				clerkId: id,
				fullName,
				imageUrl: safeImageUrl,
			},
			{
				upsert: true,
				new: true,
				setDefaultsOnInsert: true,
			}
		);

		res.status(200).json({ success: true });
	} catch (error) {
		console.log("Error in auth callback", error);
		next(error);
	}
};
