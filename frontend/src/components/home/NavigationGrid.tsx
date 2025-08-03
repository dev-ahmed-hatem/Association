import { NavLink } from "react-router";
import appRoutes, { AppRoute } from "../../app/appRoutes";

export default function NavigationGrid() {
  return (
    <div className="p3 md:p-4">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">النظام</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {appRoutes[0].children!.map((item: AppRoute, index) => (
          <NavLink
            key={index}
            to={item.path!}
            className="flex flex-col items-center justify-center py-8 p-4 bg-black text-white rounded-lg shadow-md hover:bg-shark-900"
          >
            <div className="text-xl md:text-3xl">{item.icon}</div>
            <p className="mt-2 text-base md:text-lg text-center">
              {item.label}
            </p>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
