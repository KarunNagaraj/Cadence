import Topbar from "@/components/Topbar";

const HomePage = () => {
  return (
    <div className="min-h-screen w-full flex flex-col">
      <Topbar />

      <div className="flex flex-1 items-center justify-center">
        <h1 className="text-3xl font-bold p-6">
          Home Page Loading
        </h1>
      </div>
    </div>
  );
};

export default HomePage;
