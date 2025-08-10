import { useState } from "react";
import { Table, Input, Avatar, Space } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router";
import { getInitials } from "../../utils";
import { tablePaginationConfig } from "../../utils/antd";
import Loading from "@/components/Loading";
import { ColumnsType } from "antd/es/table";
import { Client, rankValues } from "@/types/client";
import { useGetClientsQuery } from "@/app/api/endpoints/clients";
import ErrorPage from "../Error";
import { PaginatedResponse } from "@/types/paginatedResponse";

type ControlsType = {
  sort_by?: string;
  order?: string;
  filters: {
    rank?: string;
    name: string;
  };
} | null;

const ClientsList = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [controls, setControls] = useState<ControlsType>({
    filters: { name: "active" },
  });
  const navigate = useNavigate();

  const columns: ColumnsType<Client> = [
    {
      title: "اسم العضو",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Client) => (
        <Space>
          <span
            className={`mx-2 rounded-full ${
              record.is_active ? "bg-green-400" : "bg-yellow-400"
            } size-2 inline-block`}
          ></span>
          {
            <Avatar className="bg-blue-700 text-white font-semibold">
              {getInitials(record.name)}
            </Avatar>
          }
          <span className="flex flex-col">
            <div className="name text-base">{text}</div>
            <div className="id text-xs text-gray-400">
              # {record.membership_number}
            </div>
          </span>
        </Space>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
      filters: [
        { text: "في الخدمة", value: "active" },
        { text: "متقاعد", value: "retired" },
      ],
      defaultFilteredValue: controls?.filters?.name?.split(",") ?? ["active"],
    },
    {
      title: "الرتبة",
      dataIndex: "rank",
      key: "rank",
      filters: rankValues.map((filter) => ({ value: filter, text: filter })),
      defaultFilteredValue: controls?.filters?.rank?.split(","),
    },
    {
      title: "رقم الأقدمية",
      dataIndex: "seniority",
      key: "seniority",
    },
    {
      title: "القسم",
      dataIndex: "work_entity",
      key: "work_entity",
    },
    {
      title: "مستحقات",
      dataIndex: "assignments",
      key: "assignments",
    },
  ];

  // Search Function
  const onSearch = (value: string) => {
    setSearch(value);
  };

  const {
    data: rawClients,
    isFetching,
    isError,
  } = useGetClientsQuery({
    no_pagination: false,
    search,
    page,
    page_size: pageSize,
    sort_by: controls?.sort_by,
    order: controls?.order === "descend" ? "-" : "",
    status: controls?.filters.name,
    rank: controls?.filters.rank,
  });
  const clients = rawClients as PaginatedResponse<Client> | undefined;

  if (isFetching) return <Loading />;
  if (isError) return <ErrorPage />;
  return (
    <>
      <h1 className="mb-6 text-2xl md:text-3xl font-bold">الأعضاء</h1>

      <div className="flex justify-between flex-wrap mb-4">
        <Input.Search
          placeholder="ابحث عن عضو..."
          onSearch={onSearch}
          className="mb-4 w-full max-w-md h-10"
          defaultValue={search}
          allowClear={true}
          onClear={() => setSearch("")}
        />

        {/* Add Button */}
        <Link
          to={"/clients/add"}
          className="h-10 px-6 flex items-center text-white gap-2 rounded-lg
       bg-green-700 hover:bg-green-600 shadow-[0_2px_0_rgba(0,58,58,0.31)]"
        >
          <PlusOutlined />
          <span>إضافة عضو</span>
        </Link>
      </div>

      {/* Table */}
      <Table
        dataSource={clients?.data}
        columns={columns}
        onRow={(record) => ({
          onClick: () => navigate(`client-profile/${record.id}`),
        })}
        rowKey="id"
        pagination={tablePaginationConfig({
          total: clients?.count,
          current: clients?.page,
          showQuickJumper: true,
          onChange(page, pageSize) {
            setPage(page);
            setPageSize(pageSize);
          },
        })}
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
        bordered
        scroll={{ x: "max-content" }}
        className="clickable-table  black-header"
      />
    </>
  );
};

export default ClientsList;
