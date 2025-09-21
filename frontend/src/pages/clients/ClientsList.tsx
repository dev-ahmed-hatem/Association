import { useEffect, useState } from "react";
import { Table, Input, Avatar, Space, Radio, Tag, Tooltip, Badge } from "antd";
import { PlusOutlined, UserOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router";
import { tablePaginationConfig } from "../../utils/antd";
import Loading from "@/components/Loading";
import { ColumnsType } from "antd/es/table";
import { Client, Rank, rankColors, rankValues } from "@/types/client";
import { useGetClientsQuery } from "@/app/api/endpoints/clients";
import ErrorPage from "../Error";
import { PaginatedResponse } from "@/types/paginatedResponse";
import { useGetWorkEntitiesQuery } from "@/app/api/endpoints/workentities";
import { SortOrder } from "antd/lib/table/interface";

type ControlsType = {
  sort_by?: string;
  order?: SortOrder;
  filters: {
    rank?: string;
    name: string;
    work_entity?: string;
    seniority?: string;
  };
} | null;

const assignmentLabels: Record<string, string> = {
  unpaid_subscriptions: "اشتراكات",
  unpaid_installments: "أقساط",
};

const ClientsList = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [controls, setControls] = useState<ControlsType>({
    filters: { name: "active" },
  });
  const [searchType, setSearchType] = useState<
    "name__icontains" | "membership_number" | "phone_number"
  >("name__icontains");
  const navigate = useNavigate();

  const {
    data: entities,
    isLoading: fetchingEntities,
    isError: entitiesError,
  } = useGetWorkEntitiesQuery({ no_pagination: true });

  const columns: ColumnsType<Client> = [
    {
      title: "#",
      key: "index",
      render: (_: any, __: any, index: number) =>
        (page ? (page - 1) * pageSize : 0) + index + 1,
    },
    {
      title: "رقم العضوية",
      dataIndex: "membership_number",
      key: "membership_number",
      sorter: true,
      sortOrder:
        controls?.sort_by === "membership_number"
          ? controls?.order ?? null
          : null,
    },
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
            <Avatar
              className="bg-gradient-to-br from-[#2c2e83] to-[#494c9a] text-white font-semibold"
              icon={<UserOutlined />}
            />
          }
          <span className="flex flex-col">
            <div
              className={`name text-base ${
                record.is_active ? "font-bold" : "text-gray-500"
              }`}
            >
              {text}
            </div>
            <div className="id text-xs text-gray-400">
              <span>{record.membership_number}#</span>{" "}
              {!record.is_active && (
                <Tag className="text-xs m-2" color="red">
                  متقاعد
                </Tag>
              )}
            </div>
          </span>
        </Space>
      ),
      sorter: true,
      sortOrder: controls?.sort_by === "name" ? controls?.order ?? null : null,
      filters: [
        { text: "بالخدمة", value: "active" },
        { text: "متقاعد", value: "retired" },
      ],
      defaultFilteredValue: controls?.filters?.name?.split(",") ?? ["active"],
    },
    {
      title: "الرتبة",
      dataIndex: "rank",
      key: "rank",
      filters: rankValues.map((filter) => ({ value: filter, text: filter })),

      render: (rank: Rank) => (
        <Tag className="text-base" color={rankColors[rank]}>
          {rank}
        </Tag>
      ),
      defaultFilteredValue: controls?.filters?.rank?.split(","),
    },
    {
      title: "رقم الأقدمية",
      dataIndex: "seniority",
      key: "seniority",
      filters: Array.from(
        { length: new Date().getFullYear() - 1980 + 1 },
        (_, i) => 1980 + i
      ).map((year) => ({ value: year, text: year })),
      defaultFilteredValue: controls?.filters?.seniority?.split(","),
    },
    {
      title: "جهة العمل",
      dataIndex: "work_entity",
      key: "work_entity",
      filters: entities?.map((entity) => ({
        value: entity.name,
        text: entity.name,
      })),
      defaultFilteredValue: controls?.filters?.work_entity?.split(","),
    },
    {
      title: "مستحقات",
      dataIndex: "dues",
      key: "dues",
      render: (dues: Client["dues"]) => {
        if (!dues) {
          return <span>-</span>;
        }

        const entries = Object.entries(dues).filter(([_, count]) => count > 0);

        if (entries.length === 0) {
          return <span>-</span>;
        }

        return (
          <div className="flex flex-wrap gap-2">
            {entries.map(([key, count]) => (
              <Tooltip
                key={key}
                title={`${count} ${assignmentLabels[key] ?? "مستحقات"}`}
              >
                <Badge
                  count={count}
                  style={{
                    backgroundColor:
                      key === "unpaid_subscriptions" ? "#f5222d" : "#fa8c16",
                  }}
                ></Badge>
                <span className="px-2 py-1 rounded bg-gray-100">
                  {assignmentLabels[key] ?? key}
                </span>
              </Tooltip>
            ))}
          </div>
        );
      },
    },
  ];

  // Search Function
  const onSearch = (value: string) => {
    setSearch(value);
  };

  const {
    data: rawClients,
    isLoading,
    isFetching,
    isError,
  } = useGetClientsQuery({
    no_pagination: false,
    search,
    search_type: searchType,
    page,
    page_size: pageSize,
    sort_by: controls?.sort_by,
    order: controls?.order === "descend" ? "-" : "",
    status: controls?.filters.name,
    rank: controls?.filters.rank,
    graduation_year: controls?.filters.seniority,
    entities: controls?.filters.work_entity,
  });
  const clients = rawClients as PaginatedResponse<Client> | undefined;

  if (isLoading || fetchingEntities) return <Loading />;
  if (isError || entitiesError) return <ErrorPage />;
  return (
    <>
      <h1 className="mb-6 text-2xl md:text-3xl font-bold">الأعضاء</h1>

      <div className="flex justify-between flex-wrap mb-4 gap-6">
        <div className="flex flex-col w-full max-w-md">
          {/* Search Input */}
          <Input.Search
            placeholder="ابحث عن عضو..."
            onSearch={onSearch}
            className="mb-4 w-full max-w-md h-10"
            defaultValue={search}
            allowClear={true}
            onClear={() => setSearch("")}
          />

          {/* Radio Group for Search Type */}
          <div className="flex flex-wrap gap-3 items-center">
            <span>بحث ب:</span>
            <Radio.Group
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="mt-2 flex"
              defaultValue={"name__icontains"}
            >
              <Radio.Button value="name__icontains">الاسم</Radio.Button>
              <Radio.Button value="membership_number">رقم العضوية</Radio.Button>
              <Radio.Button value="phone_number">رقم الموبايل</Radio.Button>
            </Radio.Group>
          </div>
        </div>

        {/* Add Button */}
        <Link
          to={"/clients/add"}
          className="h-10 px-6 flex items-center text-white gap-2 rounded-lg
          bg-gradient-to-l from-green-800 to-green-600 hover:from-green-700
        hover:to-green-500 shadow-[0_2px_0_rgba(0,58,58,0.31)]
          transition-all duration-200"
        >
          <PlusOutlined />
          <span>إضافة عضو</span>
        </Link>
      </div>

      {isFetching && <Loading />}

      {/* Table */}
      {!isFetching && clients && (
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
            pageSize,
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
          className="clickable-table  minsk-header"
        />
      )}
    </>
  );
};

export default ClientsList;
