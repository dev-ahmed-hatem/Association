import React, { useState } from "react";
import { Table, Input, Card, Badge, Avatar } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router";
import { tablePaginationConfig } from "@/utils/antd";
import { Project } from "@/types/project";
import { SortOrder } from "antd/lib/table/interface";
import { ColumnsType } from "antd/es/table";
import ErrorPage from "../Error";
import Loading from "@/components/Loading";
import { PaginatedResponse } from "@/types/paginatedResponse";
import { useGetProjectsQuery } from "@/app/api/endpoints/projects";

type ControlsType = {
  sort_by?: string;
  order?: SortOrder;
  filters: {
    name?: string;
  };
} | null;

const ProjectsList: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [controls, setControls] = useState<ControlsType>();

  const columns: ColumnsType<Project> = [
    {
      title: "اسم المشروع",
      dataIndex: "name",
      key: "name",
      render: (_: any, record: any) => (
        <div className="flex items-center gap-3">
          <Avatar
            shape="circle"
            size="small"
            icon={
              <Badge
                status={
                  record.status === "قيد التنفيذ" ? "processing" : "success"
                }
              />
            }
            style={{ backgroundColor: "#fff" }}
          />
          <div className="flex flex-col">
            <span className="font-medium text-gray-800">{record.name}</span>
            <span className="text-xs text-gray-500">{record.id}#</span>
          </div>
        </div>
      ),
      filters: [
        { text: "قيد التنفيذ", value: "قيد التنفيذ" },
        { text: "منتهي", value: "منتهي" },
      ],
      defaultFilteredValue: controls?.filters?.name?.split(","),
      sorter: true,
      sortOrder: controls?.sort_by === "name" ? controls?.order ?? null : null,
    },
    {
      title: "تاريخ البداية",
      dataIndex: "start_date",
      key: "start_date",
      sorter: true,
      sortOrder:
        controls?.sort_by === "start_date" ? controls?.order ?? null : null,
    },
    {
      title: "إجمالي الإيرادات",
      dataIndex: "total_incomes",
      key: "total_incomes",
      render: (value: number) => (
        <span className="text-green-600 font-semibold">
          {value.toLocaleString()} ج.م
        </span>
      ),
    },
    {
      title: "إجمالي المصروفات",
      dataIndex: "total_expenses",
      key: "total_expenses",
      render: (value: number) => (
        <span className="text-red-600 font-semibold">
          {value.toLocaleString()} ج.م
        </span>
      ),
    },
    {
      title: "الصافي",
      key: "net",
      render: (_: any, record: any) => {
        const net = record.total_incomes - record.total_expenses;
        return (
          <span
            className={`font-bold ${
              net >= 0 ? "text-green-700" : "text-red-700"
            }`}
          >
            {net.toLocaleString()} ج.م
          </span>
        );
      },
    },
  ];

  // Search Function
  const onSearch = (value: string) => {
    setSearch(value);
  };

  const {
    data: rawProjects,
    isLoading,
    isFetching,
    isError,
  } = useGetProjectsQuery({
    no_pagination: false,
    search,
    page,
    page_size: pageSize,
    sort_by: controls?.sort_by,
    order: controls?.order === "descend" ? "-" : "",
    status: controls?.filters.name,
  });
  const projects = rawProjects as PaginatedResponse<Project> | undefined;

  if (isLoading) return <Loading />;
  if (isError) return <ErrorPage />;
  return (
    <>
      <h1 className="mb-6 text-2xl md:text-3xl font-bold">المشاريع</h1>

      <div className="flex justify-between flex-wrap gap-2 mb-4">
        {/* Search Input */}
        <Input.Search
          placeholder="ابحث عن مشروع..."
          onSearch={(value) => onSearch(value)}
          className="mb-4 w-full max-w-md h-10"
          defaultValue={search}
          allowClear={true}
          onClear={() => setSearch("")}
        />

        {/* Add Button */}
        <Link
          to={"/projects/add"}
          className="h-10 px-6 flex items-center text-white gap-2 rounded-lg
                bg-gradient-to-l from-green-800 to-green-600 hover:from-green-700
              hover:to-green-500 shadow-[0_2px_0_rgba(0,58,58,0.31)]
                transition-all duration-200"
        >
          <PlusOutlined />
          <span>إضافة مشروع</span>
        </Link>
      </div>

      {isFetching && <Loading />}

      {/* Table */}
      {!isFetching && projects && (
        <Table
          columns={columns}
          dataSource={projects?.data}
          rowKey="id"
          pagination={tablePaginationConfig({
            total: projects?.count,
            current: projects?.page,
            showQuickJumper: true,
            pageSize,
            onChange(page, pageSize) {
              setPage(page);
              setPageSize(pageSize);
            },
          })}
          bordered
          scroll={{ x: "max-content" }}
          className="clickable-table minsk-header"
          onChange={(_, filters, sorter: any) => {
            setControls({
              ...(sorter.column?.key && { sort_by: sorter.column.key }),
              ...(sorter.order && { order: sorter.order }),
              filters: Object.fromEntries(
                Object.entries(filters).map(([filter, values]) => [
                  filter,
                  (values as string[])?.join(),
                ])
              ),
            });
          }}
          onRow={(record) => ({
            onClick: () => navigate(`/projects/project-profile/${record.id}`),
          })}
        />
      )}
    </>
  );
};

export default ProjectsList;
