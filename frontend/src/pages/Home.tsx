import Welcome from "@/components/home/Welcome";
import NavigationGrid from "../components/home/NavigationGrid";
import ClientStats from "@/components/home/ClientsStats";
import FinancialStatistics from "@/components/home/FinancialsStatitics";
import { Divider } from "antd";

const Home = () => {
  return (
    <div className="font-bold text-xl padding-container pt-10">
      <Welcome />
      <div className="my-16"></div>
      <NavigationGrid />
      <Divider className="my-6" />
      <ClientStats />
      <Divider className="my-16" />
      <FinancialStatistics />
      <div className="my-16"></div>
    </div>
  );
};

export default Home;
