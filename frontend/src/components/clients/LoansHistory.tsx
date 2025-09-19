import { useEffect, useState } from "react";
import { Table, Statistic } from "antd";
import dayjs from "dayjs";
import { useNavigate } from "react-router";
import { ColumnsType } from "antd/es/table";
import { SortOrder } from "antd/lib/table/interface";

import Loading from "@/components/Loading";
import { PaginatedResponse } from "@/types/paginatedResponse";

import { Loan } from "@/types/loan";
import { useLazyGetLoansQuery } from "@/app/api/endpoints/loans";
import ErrorPage from "@/pages/Error";
import { tablePaginationConfig } from "@/utils/antd";

const LoansHistory: React.FC<{ client_id: string }> = ({ client_id }) => {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [controls, setControls] = useState<{
    sort_by?: string;
    order?: SortOrder;
  }>();

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
    getLoans({
      client_id,
      no_pagination: false,
      page,
      page_size: pageSize,
      sort_by: controls?.sort_by,
      order: controls?.order === "descend" ? "-" : "",
    });
  }, [page, pageSize, controls]);

  if (isFetching) return <Loading />;
  if (isError) return <ErrorPage />;

  return (
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
      title={() => "سجل القروض"}
      onRow={(record) => ({
        onClick: (e) => {
          navigate(`/financials/loans/${record.id}`);
        },
      })}
    />
  );
};

export default LoansHistory;
