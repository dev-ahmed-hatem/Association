import Welcome from "@/components/home/Welcome";
import NavigationGrid from "../components/home/NavigationGrid";
import ClientStats from "@/components/home/ClientsStats";

const Home = () => {
  return (
    <div className="font-bold text-xl padding-container pt-10">
      <Welcome />
      <div className="my-6"></div>
      <ClientStats />
      <div className="my-16"></div>
      <NavigationGrid />
      <div className="my-16"></div>
    </div>
  );
};

export default Home;
