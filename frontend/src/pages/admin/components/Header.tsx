import { UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const Header = () => {
	return (
		<div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8'>
			<div className='flex items-center gap-3'>
				<Link to='/' className='rounded-lg'>
					<img
						src='/cadence-high-resolution-logo-transparent.png'
						alt='Cadence Logo'
						className='h-8 w-auto object-contain'
					/>
				</Link>
				<div>
					<h1 className='text-2xl sm:text-3xl font-bold'>Music Manager</h1>
					<p className='text-zinc-400 mt-1 text-sm'>Manage your music catalog</p>
				</div>
			</div>
			<div className='self-end sm:self-auto'>
				<UserButton />
			</div>
		</div>
	);
};
export default Header;