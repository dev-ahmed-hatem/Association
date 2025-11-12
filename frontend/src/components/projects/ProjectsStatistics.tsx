import { useGetProjectsStatsQuery } from "@/app/api/endpoints/projects";
import { ProjectsStats } from "@/types/project";
import { Button, Card, message, Result } from "antd";
import {
  FaProjectDiagram,
  FaCheckCircle,
  FaRunning,
  FaArrowUp,
  FaArrowDown,
  FaBalanceScale,
} from "react-icons/fa";
import Loading from "../Loading";

const ProjectStatistics = () => {
  const stats = (stats: ProjectsStats) => [
    {
      title: "إجمالي المشروعات",
      value: stats.total_projects,
      icon: <FaProjectDiagram size={28} />,
      gradient: "from-blue-400 to-blue-600",
    },
    {
      title: "قيد التنفيذ",
      value: stats.in_progress,
      icon: <FaRunning size={28} />,
      gradient: "from-yellow-400 to-yellow-600",
    },
    {
      title: "منتهي",
      value: stats.completed,
      icon: <FaCheckCircle size={28} />,
      gradient: "from-green-400 to-green-600",
    },
    {
      title: "إجمالي الإيرادات",
      value: `${stats.total_incomes.toLocaleString()} ج.م`,
      icon: <FaArrowUp size={28} />,
      gradient: "from-indigo-400 to-indigo-600",
    },
    {
      title: "إجمالي المصروفات",
      value: `${stats.total_expenses.toLocaleString()} ج.م`,
      icon: <FaArrowDown size={28} />,
      gradient: "from-red-400 to-red-600",
    },
    {
      title: "الصافي",
      value: `${stats.net.toLocaleString()} ج.م`,
      icon: <FaBalanceScale size={28} />,
      gradient: "from-purple-400 to-purple-600",
    },
  ];

  const { data, isFetching, isError, refetch } = useGetProjectsStatsQuery();

  if (isFetching) return <Loading />;
  if (isError)
    return (
      <Result
        status="error"
        title={<span className="font-bold">خطأ</span>}
        subTitle={"حدث خطأ أثناء الحصول على إحصائيات المشاريع"}
        extra={[
          <Button key="retry" type="primary" onClick={refetch}>
            إعادة المحاولة
          </Button>,
        ]}
      />
    );
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats(data!).map((stat, idx) => (
        <Card
          key={idx}
          className={`shadow-lg rounded-2xl text-white`}
          styles={{
            body: {
              padding: "1.5rem",
              background: `linear-gradient(to right, var(--tw-gradient-stops))`,
            },
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
