import Topbar from "@/components/TopBar";
import { Loader } from "lucide-react";
const HomePage= () => {
    return (
      <div className='h-screen w-full flex flex-col items-center justify-center'>
        <h1 className='text-3xl font-bold p-6'>Home Page Loading</h1>
				<Topbar />
			</div>
    )
  }

export default HomePage