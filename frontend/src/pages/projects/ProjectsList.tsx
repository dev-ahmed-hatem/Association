import ProjectsOverview from "@/components/projects/ProjectOverview";
import { Input, Table, Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Project, statusColors } from "@/types/project";
import { tablePaginationConfig } from "@/utils/antd";
import { Link, useNavigate } from "react-router";
import { AssignedEmployee } from "@/types/employee";
import Error from "@/pages/Error";
import Loading from "@/components/Loading";
import {
  useGetProjectsQuery,
  useGetProjectsStatsQuery,
} from "@/app/api/endpoints/projects";
import { isOverdue } from "@/utils";

// Define table columns
const columns: (statusFilter: string[] | null) => ColumnsType<Project> = (
  statusFilter = []
) => [
  {
    title: "اسم المشروع",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "الحالة",
    dataIndex: "status",
    key: "status",
    filters: [
      { text: "قيد التنفيذ", value: "ongoing" },
      { text: "مكتمل", value: "completed" },
      { text: "قيد الموافقة", value: "pending-approval" },
      { text: "متوقف", value: "paused" },
      { text: "متأخر", value: "overdue" },
    ],
    filteredValue: statusFilter,
    filterOnClose: false,
    render: (status: Project["status"], record) => (
      <div className="flex gap-2">
        <Tag color={statusColors[status]}>{status}</Tag>
        {record.end_date &&
          isOverdue(record.end_date) &&
          !["مكتمل", "قيد الموافقة"].includes(record.status) && (
            <Tag color="red">متأخر</Tag>
          )}
      </div>
    ),
  },
  {
    title: "تاريخ البدء",
    dataIndex: "start_date",
    key: "start_date",
    sorter: (a, b) => dayjs(a.start_date).unix() - dayjs(b.start_date).unix(),
    render: (date) => dayjs(date).format("YYYY-MM-DD"),
  },
  {
    title: "تاريخ الانتهاء",
    dataIndex: "end_date",
    key: "end_date",
    sorter: (a, b) => dayjs(a.end_date).unix() - dayjs(b.end_date).unix(),
    render: (date) => (date ? dayjs(date).format("YYYY-MM-DD") : "-"),
  },
  {
    title: "المشرفون",
    dataIndex: "supervisors",
    key: "supervisors",
    render: (value: AssignedEmployee[]) => value.map((s) => s.name).join("، "),
    ellipsis: true,
  },
];

const ProjectsList = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilters, setStatusFilters] = useState<string[] | null>(null);
  const navigate = useNavigate();

  // Search Function
  const onSearch = (value: string) => {
    setSearch(value);
  };

  // handle projects stats
  const {
    data: stats,
    isLoading: gettingStats,
    isError: statsError,
  } = useGetProjectsStatsQuery();

  // handling projects
  const { data, isLoading, isFetching, isError, refetch } = useGetProjectsQuery(
    {
      page: page,
      search: search,
      status_filters: statusFilters?.join(),
    }
  );

  useEffect(() => {
    refetch();
  }, [search, page, statusFilters]);

  if (isLoading || gettingStats) return <Loading />;
  if (isError || statsError) return <Error />;
  return (
    <div>
      <ProjectsOverview {...stats!} />
      <h1 className="my-6 text-2xl md:text-3xl text-centr font-bold">
        المشاريع
      </h1>

      {isFetching ? (
        <Loading />
      ) : (
        <>
          <div className="flex justify-between flex-wrap mb-4">
            <Input.Search
              placeholder="ابحث عن مشروع..."
              onSearch={onSearch}
              className="mb-4 w-full max-w-md h-10"
              defaultValue={search}
              allowClear={true}
              onClear={() => setSearch("")}
            />

            {/* Add Button */}
            <Link
              to={"/projects/add"}
              className="h-10 px-6 flex items-center text-white gap-2 rounded-lg
          bg-green-700 hover:bg-green-600 shadow-[0_2px_0_rgba(0,58,58,0.31)]"
            >
              <PlusOutlined />
              <span>إضافة مشروع</span>
            </Link>
          </div>

          <Table
            dataSource={data?.data}
            columns={columns(statusFilters)}
            onRow={(record) => ({
              onClick: () => navigate(`project/${record.id}`),
            })}
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

export default ProjectsList;
