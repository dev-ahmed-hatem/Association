import { Input, Space, Table, Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { priorityColors, statusColors, Task } from "../../types/task";
import { tablePaginationConfig } from "@/utils/antd";
import { Link, useNavigate } from "react-router";
import TasksOverview from "@/components/tasks/TasksOverview";
import {
  useGetTasksQuery,
  useGetTasksStatsQuery,
} from "@/app/api/endpoints/tasks";
import Loading from "@/components/Loading";
import Error from "@/pages/Error";
import { isOverdue } from "@/utils";

const columns: (
  statusFilter?: string[] | null,
  priorityFilters?: string[] | null
) => ColumnsType<Task> = (statusFilter = [], priorityFilters = []) => [
  {
    title: "اسم المهمة",
    dataIndex: "title",
    key: "title",
    render: (value, record) => (
      <Space>
        <span className="flex flex-col">
          <div className="name text-base">{value}</div>
          <div className="id text-xs text-gray-400">#{record.id}</div>
        </span>
      </Space>
    ),
  },
  {
    title: "الحالة",
    dataIndex: "status",
    key: "status",
    filters: [
      { text: "مكتمل", value: "completed" },
      { text: "غير مكتمل", value: "incomplete" },
      { text: "متأخر", value: "overdue" },
    ],
    defaultFilteredValue: statusFilter,
    filterOnClose: false,
    render: (status: Task["status"], record) => (
      <div className="flex gap-2">
        <Tag color={statusColors[status]}>{status}</Tag>
        {isOverdue(record.due_date) && record.status === "غير مكتمل" && (
          <Tag color="red">متأخر</Tag>
        )}
      </div>
    ),
  },
  {
    title: "الأولوية",
    dataIndex: "priority",
    key: "priority",
    filters: [
      { text: "منخفض", value: "low" },
      { text: "متوسط", value: "medium" },
      { text: "مرتفع", value: "high" },
    ],
    defaultFilteredValue: priorityFilters,
    filterOnClose: false,
    render: (priority: Task["priority"]) => (
      <Tag color={priorityColors[priority]}>{priority}</Tag>
    ),
  },
  {
    title: "المشروع المرتبط",
    dataIndex: "project",
    key: "project",
    render: (project) =>
      project ? (
        <Link
          to={`/projects/project/${project.id}/`}
          className="text-blue-700 hover:underline hover:text-blue-500"
        >
          {project.name}
        </Link>
      ) : (
        <Tag color="gray">غير مرتبط</Tag>
      ),
  },
  {
    title: "تاريخ الاستحقاق",
    dataIndex: "due_date",
    key: "due_date",
    sorter: (a, b) => dayjs(a.due_date).unix() - dayjs(b.due_date).unix(),
    render: (date) => dayjs(date).format("YYYY-MM-DD"),
  },
];

const TasksList = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilters, setStatusFilters] = useState<string[] | null>(null);
  const [priorityFilters, setPriorityFilters] = useState<string[] | null>(null);
  const navigate = useNavigate();

  // Search Function
  const onSearch = (value: string) => {
    setSearch(value);
  };

  // handle tasks stats
  const {
    data: stats,
    isLoading: gettingStats,
    isError: statsError,
  } = useGetTasksStatsQuery();

  // handling tasks
  const { data, isLoading, isFetching, isError, refetch } = useGetTasksQuery({
    page: page,
    search: search,
    status_filters: statusFilters?.join(),
    priority_filters: priorityFilters?.join(),
  });

  useEffect(() => {
    refetch();
  }, [search, page, statusFilters, priorityFilters]);

  if (isLoading || gettingStats) return <Loading />;
  if (isError || statsError) return <Error />;
  return (
    <div>
      <TasksOverview stats={stats!} />
      <h1 className="my-6 text-2xl md:text-3xl font-bold">المهام</h1>

      {isFetching ? (
        <Loading />
      ) : (
        <>
          <div className="flex justify-between flex-wrap mb-4">
            <Input.Search
              placeholder="ابحث عن مهمة..."
              onSearch={onSearch}
              className="mb-4 w-full max-w-md h-10"
              defaultValue={search}
              allowClear={true}
              onClear={() => setSearch("")}
            />

            {/* Add Button */}
            <Link
              to={"/tasks/add"}
              className="h-10 px-6 flex items-center text-white gap-2 rounded-lg
         bg-green-700 hover:bg-green-600 shadow-[0_2px_0_rgba(0,58,58,0.31)]"
            >
              <PlusOutlined />
              <span>إضافة مهمة</span>
            </Link>
          </div>

          <Table
            columns={columns(statusFilters, priorityFilters)}
            onRow={(record) => ({
              onClick: (e) => {
                const target = e.target as HTMLElement;

                // Check if the click originated inside a link
                const isInsideLink = target.closest("a");

                if (!isInsideLink) {
                  navigate(`task/${record.id}`);
                }
              },
            })}
            dataSource={data?.data}
            rowKey="id"
            pagination={tablePaginationConfig({
              total: data?.count,
              current: data?.page,
              onChange(page) {
                setPage(page);
              },
            })}
            onChange={(pagination, filters, sorter) => {
              setStatusFilters(filters.status as string[]);
              setPriorityFilters(filters.priority as string[]);
            }}
            bordered
            scroll={{ x: "max-content" }}
            className="clickable-table calypso-header"
          />
        </>
      )}
    </div>
  );
};

export default TasksList;
