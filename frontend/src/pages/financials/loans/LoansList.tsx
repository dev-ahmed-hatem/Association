import { useEffect, useState } from "react";
import { Table, Statistic, Input, Radio, Space, Avatar, Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { Link, Outlet, useMatch, useNavigate } from "react-router";
import { ColumnsType } from "antd/es/table";
import { SortOrder } from "antd/lib/table/interface";

import Loading from "@/components/Loading";
import { PaginatedResponse } from "@/types/paginatedResponse";

import { Loan } from "@/types/loan";
import { useLazyGetLoansQuery } from "@/app/api/endpoints/loans";
import ErrorPage from "@/pages/Error";
import { tablePaginationConfig } from "@/utils/antd";
import { usePermission } from "@/providers/PermissionProvider";
import { rankColors } from "@/types/client";
import { getInitials } from "@/utils";

const LoansList: React.FC = () => {
  const { can, hasModulePermission } = usePermission();
  const isLoans = useMatch("/financials/loans");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [controls, setControls] = useState<{
    sort_by?: string;
    order?: SortOrder;
  }>();
  const [searchType, setSearchType] = useState<
    "name__icontains" | "membership_number" | "phone_number"
  >("name__icontains");

  const [getLoans, { data: loansData, isLoading, isFetching, isError }] =
    useLazyGetLoansQuery();
  const loans = loansData as PaginatedResponse<Loan>;

  const columns: ColumnsType<Loan> = [
    {
      title: "#",
      key: "index",
      render: (_: any, __: any, index: number) =>
        (page ? (page - 1) * pageSize : 0) + index + 1,
    },
    {
      title: "التاريخ",
      dataIndex: "issued_date",
      key: "issued_date",
      render: (date: string) => dayjs(date).format("YYYY-MM-DD"),
      sorter: true,
      sortOrder:
        controls?.sort_by === "issued_date" ? controls?.order ?? null : null,
    },
    {
      title: "العضو",
      dataIndex: "client_data",
      key: "client_data",
      render: (client: Loan["client_data"]) => (
        <Space>
          {
            <Avatar className="bg-gradient-to-br from-[#2c2e83] to-[#494c9a] text-white font-semibold">
              {getInitials(client.name)}
            </Avatar>
          }
          <span className="flex flex-col">
            <Link
              to={`/clients/client-profile/${client.id}/`}
              className={`name text-base font-bold hover:underline hover:text-minsk`}
            >
              {client.name}
            </Link>
            <div className="id text-xs text-gray-400">
              <span>{client.membership_number}#</span>{" "}
              <Tag className="text-sm m-2" color={rankColors[client.rank]}>
                {client.rank}
              </Tag>
            </div>
          </span>
        </Space>
      ),
    },
    {
      title: "القيمة",
      dataIndex: "amount",
      key: "amount",
      render: (value: number) => (
        <Statistic
          value={value}
          suffix="ج.م"
          valueStyle={{ color: "#cf1322", fontSize: "16px" }}
        />
      ),
      sorter: (a, b) => a.amount - b.amount,
      sortOrder:
        controls?.sort_by === "amount" ? controls?.order ?? null : null,
    },
    {
      title: "السداد",
      dataIndex: "repayments",
      key: "repayments",
      render: (value, record) => (
        <span>
          {record.repayments.paid} من {record.repayments.total}
        </span>
      ),
    },
    {
      title: "ملاحظات",
      dataIndex: "notes",
      key: "notes",
      render: (text: string) => text || "-",
    },
  ];

  useEffect(() => {
    if (isLoans) {
      getLoans({
        search: search,
        no_pagination: false,
        page,
        page_size: pageSize,
        sort_by: controls?.sort_by,
        order: controls?.order === "descend" ? "-" : "",
        search_type: searchType,
      });
    }
  }, [page, pageSize, controls, search]);

  if (!isLoans) return <Outlet />;

  if (isLoading) return <Loading />;
  if (isError) return <ErrorPage />;

  if (!hasModulePermission("loans"))
    return (
      <ErrorPage
        title="ليس لديك صلاحية للوصول إلى هذه الصفحة"
        subtitle="يرجى التواصل مع مدير النظام للحصول على الصلاحيات اللازمة."
        reload={false}
      />
    );

  return (
    <>
      <h1 className="mb-6 text-2xl md:text-3xl font-bold">القروض</h1>

      <div className="flex justify-end flex-wrap gap-2 mb-4">
        {can("loans.add") && (
          <Link
            to="add"
            className="h-10 px-6 flex items-center text-white gap-2 rounded-lg
         bg-gradient-to-l from-green-800 to-green-600 
        hover:from-green-700 hover:to-green-500 shadow-[0_2px_0_rgba(0,58,58,0.31)]
         transition-all duration-200"
          >
            <PlusOutlined />
            إضافة قرض
          </Link>
        )}
      </div>

      <div className="flex justify-between flex-wrap gap-2 mb-4">
        {can("loans.view") && (
          <div className="flex flex-col w-full max-w-md">
            {/* Search Input */}
            <Input.Search
              placeholder="ابحث عن عضو..."
              onSearch={(value) => setSearch(value)}
              className="mb-2 w-full max-w-md h-10"
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
                <Radio.Button value="membership_number">
                  رقم العضوية
                </Radio.Button>
                <Radio.Button value="phone_number">رقم الموبايل</Radio.Button>
              </Radio.Group>
            </div>
          </div>
        )}
      </div>

      {isFetching && <Loading />}

      {can("loans.view") && !isFetching && (
        <Table
          dataSource={loans?.data}
          columns={columns}
          rowKey="id"
          pagination={tablePaginationConfig({
            total: loans?.count,
            current: loans?.page,
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
            });
          }}
          bordered
          scroll={{ x: "max-content" }}
          className="clickable-table minsk-header"
          onRow={(record) => ({
            onClick: (e) => {
              const target = e.target as HTMLElement;

              // Check if the click originated inside a link
              const isInsideLink = target.closest("a");

              if (!isInsideLink) {
                navigate(`${record.id}`);
              }
            },
          })}
        />
      )}
    </>
  );
};

export default LoansList;
