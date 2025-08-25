import React, { useState } from "react";
import { Table, Input, Card } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router";
import { tablePaginationConfig } from "@/utils/antd";

const mockProjects = [
  { id: 1, name: "مشروع بناء", manager: "محمد علي", start_date: "2025-01-01" },
  { id: 2, name: "مشروع صيانة", manager: "أحمد حسن", start_date: "2025-02-10" },
  {
    id: 3,
    name: "مشروع تطوير",
    manager: "خالد إبراهيم",
    start_date: "2025-03-05",
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
    },
    {
      title: "المدير",
      dataIndex: "manager",
      key: "manager",
    },
    {
      title: "تاريخ البداية",
      dataIndex: "start_date",
      key: "start_date",
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
