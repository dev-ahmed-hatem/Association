import { Link } from "react-router";
import {
  DollarOutlined,
  ShoppingOutlined,
  CreditCardOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

const navItems = [
  {
    path: "/financials/incomes",
    label: "الإيرادات",
    icon: <DollarOutlined />,
    color: "from-green-500 to-green-700",
  },
  {
    path: "/financials/expenses",
    label: "المصروفات",
    icon: <ShoppingOutlined />,
    color: "from-red-500 to-red-700",
  },
  {
    path: "/financials/installments",
    label: "الأقساط",
    icon: <CreditCardOutlined />,
    color: "from-blue-500 to-blue-700",
  },
  {
    path: "/financials/subscriptions",
    label: "الاشتراكات الشهرية",
    icon: <CalendarOutlined />,
    color: "from-purple-500 to-purple-700",
  },
];

const FinancialsNav = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
      {navItems.map((item) => {
        return (
          <Link
            key={item.path}
            to={item.path}
            className="flex flex-col items-center justify-center py-8 p-4 
                    rounded-lg shadow-md
                    bg-gradient-to-bl from-minsk-700 to-minsk-900 
                    text-white hover:from-minsk-600 hover:to-minsk-800"
          >
            <div className="text-xl md:text-3xl">{item.icon}</div>
            <p className="mt-2 text-base md:text-lg text-center">
              {item.label}
            </p>
          </Link>
        );
      })}
    </div>
  );
};

export default FinancialsNav;
