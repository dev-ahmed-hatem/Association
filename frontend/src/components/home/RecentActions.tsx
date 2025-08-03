import { FaEdit, FaPlus } from "react-icons/fa";

const recentActions = [
  {
    name: "kaffo",
    type: "ملاحظة",
    icon: <FaEdit className="text-orange-600" />,
  },
  {
    name: "user 2",
    type: "مشروع",
    icon: <FaEdit className="text-orange-600" />,
  },
  {
    name: "ahmed_h",
    type: "تكليف",
    icon: <FaEdit className="text-orange-600" />,
  },
  {
    name: "ahmed_h",
    type: "موعد",
    icon: <FaPlus className="text-green-500" />,
  },
  {
    name: "Ahmed",
    type: "ملف",
    icon: <FaEdit className="text-orange-600" />,
  },
  //   {
  //     name: "Ahmed",
  //     type: "Project",
  //     icon: <FaEdit className="text-orange-600" />,
  //   },
];

const RecentActions = () => {
  return (
    <div className="bg-calypso-50 text-calypso-950 p-4 rounded-lg shadow-md md:w-72 lg:w-80">
      <h2 className="text-lg font-semibold border-b border-calypso-950 pb-2 mb-2">
        الإجراءات الأخيرة
      </h2>
      <h3 className="text-sm font-bold text-calypso mb-2">إجراءاتي</h3>
      <ul className="space-y-2">
        {recentActions.map((action, index) => (
          <li
            key={index}
            className="flex items-center gap-2 text-sm border-b border-calypso-700 pb-2 last:border-none"
          >
            {action.icon}
            <div className="flex flex-col">
              <span className="text-orange-950 cursor-pointer hover:underline">
                {action.name}
              </span>
              <span className="text-gray-400 text-xs">{action.type}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentActions;
