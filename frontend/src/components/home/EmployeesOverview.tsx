import { FaUsers } from "react-icons/fa6";
import { NavLink } from "react-router";

const EmployeesOverview = () => {
  const stats = [
    { title: "يعمل من المقر", count: 132 },
    { title: "يعمل عن بعد", count: 26 },
    { title: "موجود الآن", count: 103 },
    { title: "في أجازة", count: 3 },
  ];

  return (
    <div className="flex flex-col md:flex-row rounded-lg shadow-lg w-full max-w-3xl overflow-hidden">
      {/* Left Section - Total Employees */}
      <NavLink
        to={"/employees"}
        className="bg-calypso-800 hover:bg-calypso-700 flex flex-col
        text-white py-10 px-6 gap-y-4 w-full md:w-1/3"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-semibold">إجمالي الموظفين</h2>
          <FaUsers className="text-3xl md:text-4xl" />
        </div>
        <p className="text-4xl md:text-5xl font-bold">300</p>
      </NavLink>

      {/* Right Section - Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 w-full md:w-2/3">
        {stats.map((item, index) => (
          <div
            key={index}
            className="flex flex-col gap-y-2 justify-between border-b pb-4"
          >
            <h3 className="font-semibold text-gray-800 text-base md:text-lg">
              {item.title}
            </h3>
            <div className="flex items-center mt-1">
              <p className="text-2xl font-bold text-calypso-600">
                {item.count}
              </p>
            </div>
            <p className="text-xs text-gray-500">
              {item.count > 10 || item.count < 3 ? "موظف" : "موظفين"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeesOverview;
