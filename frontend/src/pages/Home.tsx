import Welcome from "@/components/home/Welcome";
import Calendar from "../components/home/calendar/Calendar";
import EmployeesOverview from "../components/home/EmployeesOverview";
import LatestNotes from "../components/home/LatestNotes";
import NavigationGrid from "../components/home/NavigationGrid";
import RecentActions from "../components/home/RecentActions";

const Home = () => {
  return (
    <div className="font-bold text-xl padding-container pt-10">
      <Welcome />
      {/* <div className="flex max-md:flex-col gap-y-8 gap-x-6 justify-between md:max-g-[360px]">
        <EmployeesOverview />
        <RecentActions />
      </div>
      <div className="my-16"></div>
      <Calendar />
      <div className="my-16"></div>
      <LatestNotes /> */}
      <div className="my-16"></div>
      <NavigationGrid />
      <div className="my-16"></div>
    </div>
  );
};

export default Home;
