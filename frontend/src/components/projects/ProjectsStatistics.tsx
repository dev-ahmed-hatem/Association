import { Card } from "antd";
import {
  FaProjectDiagram,
  FaCheckCircle,
  FaRunning,
  FaArrowUp,
  FaArrowDown,
  FaBalanceScale,
} from "react-icons/fa";

type ProjectStatsProps = {
  totalProjects: number;
  inProgress: number;
  completed: number;
  totalIncomes: number;
  totalExpenses: number;
  net: number;
};

const mockProjectStats = {
  totalProjects: 12,
  inProgress: 7,
  completed: 5,
  totalIncomes: 125000,
  totalExpenses: 82000,
  net: 43000,
};

const ProjectStatistics = ({
  totalProjects,
  inProgress,
  completed,
  totalIncomes,
  totalExpenses,
  net,
}: ProjectStatsProps) => {
  const stats = [
    {
      title: "إجمالي المشاريع",
      value: totalProjects,
      icon: <FaProjectDiagram size={28} />,
      gradient: "from-blue-400 to-blue-600",
    },
    {
      title: "قيد التنفيذ",
      value: inProgress,
      icon: <FaRunning size={28} />,
      gradient: "from-yellow-400 to-yellow-600",
    },
    {
      title: "منتهي",
      value: completed,
      icon: <FaCheckCircle size={28} />,
      gradient: "from-green-400 to-green-600",
    },
    {
      title: "إجمالي الإيرادات",
      value: `${totalIncomes.toLocaleString()} ج.م`,
      icon: <FaArrowUp size={28} />,
      gradient: "from-indigo-400 to-indigo-600",
    },
    {
      title: "إجمالي المصروفات",
      value: `${totalExpenses.toLocaleString()} ج.م`,
      icon: <FaArrowDown size={28} />,
      gradient: "from-red-400 to-red-600",
    },
    {
      title: "الصافي",
      value: `${net.toLocaleString()} ج.م`,
      icon: <FaBalanceScale size={28} />,
      gradient: "from-purple-400 to-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, idx) => (
        <Card
          key={idx}
          className={`shadow-lg rounded-2xl text-white`}
          bodyStyle={{
            padding: "1.5rem",
            background: `linear-gradient(to right, var(--tw-gradient-stops))`,
          }}
        >
          <div
            className={`bg-gradient-to-r ${stat.gradient} p-4 rounded-2xl flex items-center justify-between`}
          >
            <div>
              <h3 className="text-lg font-semibold">{stat.title}</h3>
              <p className="text-2xl font-bold mt-2">{stat.value}</p>
            </div>
            <div className="ml-4">{stat.icon}</div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ProjectStatistics;
