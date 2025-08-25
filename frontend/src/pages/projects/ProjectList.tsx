import React, { useState } from "react";
import { Table, Input, Card, Badge, Avatar } from "antd";
import { FolderOutlined, PlusOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router";
import { tablePaginationConfig } from "@/utils/antd";
import { Project } from "@/types/project";

const mockProjects = [
  {
    id: 1,
    name: "مشروع بناء",
    staatus: "قيد التنفيذ",
    start_date: "2025-01-01",
    total_income: 100,
    total_expenses: 100,
    net: 200,
  },
  {
    id: 2,
    name: "مشروع صيانة",
    staatus: "منتهي",
    start_date: "2025-02-10",
    total_income: 100,
    total_expenses: 100,
    net: 200,
  },
  {
    id: 3,
    name: "مشروع تطوير",
    staatus: "قيد التنفيذ",
    start_date: "2025-03-05",
    total_income: 100,
    total_expenses: 100,
    net: 200,
  },
];

const ProjectsList: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filteredProjects = mockProjects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
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
                text={record.status}
              />
            }
            style={{ backgroundColor: "#fff" }}
          />
          <div className="flex flex-col">
            <span className="font-medium text-gray-800">{record.name}</span>
            <span className="text-xs text-gray-500">#{record.id}</span>
          </div>
        </div>
      ),
    },
    {
      title: "تاريخ البداية",
      dataIndex: "start_date",
      key: "start_date",
    },
    {
      title: "إجمالي الإيرادات",
      dataIndex: "total_income",
      key: "total_income",
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
        const net = record.total_income - record.total_expenses;
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

  return (
    <>
      <h1 className="mb-6 text-2xl md:text-3xl font-bold">المشاريع</h1>

      <div className="flex justify-between flex-wrap gap-2 mb-4">
        {/* Search Input */}
        <Input.Search
          placeholder="ابحث عن مشروع..."
          onSearch={() => {}}
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

      {/* 🔹 Projects Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredProjects}
          rowKey="id"
          pagination={tablePaginationConfig()}
          bordered
          scroll={{ x: "max-content" }}
          className="clickable-table minsk-header"
          onRow={(record) => ({
            onClick: () => navigate(`/projects/project-profile/${record.id}`),
          })}
        />
      </Card>
    </>
  );
};

export default ProjectsList;
