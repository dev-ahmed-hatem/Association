import { Link } from "react-router";
import { CreditCardOutlined, CalendarOutlined } from "@ant-design/icons";
import { GiPayMoney, GiReceiveMoney } from "react-icons/gi";
import { FaHandHoldingUsd } from "react-icons/fa";

const navItems = [
  {
    path: "/financials/incomes",
    label: "الإيرادات",
    icon: <GiReceiveMoney />,
  },
  {
    path: "/financials/expenses",
    label: "المصروفات",
    icon: <GiPayMoney />,
  },
  {
    path: "/financials/subscriptions",
    label: "الاشتراكات الشهرية",
    icon: <CalendarOutlined />,
  },
  {
    path: "/financials/installments",
    label: "الأقساط",
    icon: <CreditCardOutlined />,
  },
  {
    path: "/financials/loans",
    label: "القروض",
    icon: <FaHandHoldingUsd />,
  },
];

const FinancialsNav = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full">
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
