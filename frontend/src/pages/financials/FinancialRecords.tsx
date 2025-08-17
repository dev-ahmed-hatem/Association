import { useEffect, useState } from "react";
import { Table, DatePicker, Statistic, Tag } from "antd";
import { PlusOutlined, CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { Link, Outlet, useMatch, useNavigate } from "react-router";
import { FinancialRecord, paymentMethodColors } from "@/types/financial_record";
import { tablePaginationConfig } from "../../utils/antd";
import { ColumnsType } from "antd/es/table";
import { TransactionKindArabic } from "@/types/transaction_type";
import { useLazyGetFinancialRecordsQuery } from "@/app/api/endpoints/financial_records";
import Loading from "@/components/Loading";
import ErrorPage from "../Error";
import { PaginatedResponse } from "@/types/paginatedResponse";
import { useGetTransactionTypesQuery } from "@/app/api/endpoints/transaction_types";

type Props = {
  financialType: "income" | "expense";
};

type ControlsType = {
  sort_by?: string;
  order?: string;
  filters: {
    payment_method?: string;
    transaction_type?: string;
  };
} | null;

const FinancialRecords: React.FC<Props> = ({ financialType }) => {
  const isFinancials = useMatch(`/financials/${financialType}s`);
  const [selectedDate, setSelectedDate] = useState<string>(
    dayjs().format("YYYY-MM-DD")
  );
  const pageTitle = financialType === "income" ? "الإيرادات" : "المصروفات";
  const addButtonLabel =
    financialType === "income" ? "إضافة إيراد" : "إضافة مصروف";
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [controls, setControls] = useState<ControlsType>();

  const {
    data: types,
    isFetching: typesLoading,
    isError: typesIsError,
  } = useGetTransactionTypesQuery({
    no_pagination: true,
    type: TransactionKindArabic[financialType],
  });

  const [
    getRecords,
    { data: financialRecords, isLoading, isFetching, isError },
  ] = useLazyGetFinancialRecordsQuery();
  const records = financialRecords as PaginatedResponse<FinancialRecord>;

  const columns: ColumnsType<FinancialRecord> = [
    {
      title: "رقم العملية",
      dataIndex: "id",
      key: "id",
      sorter: true,
    },
    {
      title: "التاريخ",
      dataIndex: "date",
      key: "date",
      render: (date: string) => dayjs(date).format("YYYY-MM-DD"),
    },
    {
      title: "الفئة",
      dataIndex: "transaction_type",
      key: "transaction_type",
      render: (text, record) => record.transaction_type.name,
      filters: types?.map((type) => ({ text: type.name, value: type.name })),
      defaultFilteredValue: controls?.filters?.transaction_type?.split(","),
    },
    {
      title: "طريقة الدفع",
      dataIndex: "payment_method",
      key: "payment_method",
      render: (text, record) => (
        <Tag
          className="text-base"
          color={paymentMethodColors[record.payment_method]}
        >
          {record.payment_method}
        </Tag>
      ),
      filters: [
        { text: "إيصال بنكي", value: "إيصال بنكي" },
        { text: "نقدي", value: "نقدي" },
      ],
      defaultFilteredValue: controls?.filters?.payment_method?.split(","),
    },
    {
      title: "القيمة",
      dataIndex: "amount",
      key: "amount",
      render: (value: number) => (
        <Statistic
          value={value}
          suffix="ج.م"
          valueStyle={{
            color: financialType === "income" ? "#3f8600" : "#cf1322",
            fontSize: "16px",
          }}
        />
      ),
      sorter: (a, b) => a.amount - b.amount,
    },
  ];

  useEffect(() => {
    if (isFinancials) {
      getRecords({
        no_pagination: false,
        type: TransactionKindArabic[financialType],
        page,
        page_size: pageSize,
        date: selectedDate,
        sort_by: controls?.sort_by,
        order: controls?.order === "descend" ? "-" : "",
        payment_methods: controls?.filters.payment_method,
        transaction_types: controls?.filters.transaction_type,
      });
    }
  }, [page, pageSize, selectedDate, financialType, controls]);

  if (!isFinancials) return <Outlet />;

  if (isLoading || typesLoading) return <Loading />;
  if (isError || typesIsError) return <ErrorPage />;
  return (
    <>
      <h1 className="mb-6 text-2xl md:text-3xl font-bold">{pageTitle}</h1>

      <div className="flex justify-end flex-wrap gap-2 mb-4">
        <Link
          to={"add"}
          className="h-10 px-6 flex items-center text-white gap-2 rounded-lg
         bg-gradient-to-l from-green-800 to-green-600 
        hover:from-green-700 hover:to-green-500 shadow-[0_2px_0_rgba(0,58,58,0.31)]
         transition-all duration-200"
        >
          <PlusOutlined />
          {addButtonLabel}
        </Link>
      </div>
      <div className="flex justify-between flex-wrap gap-2">
        <DatePicker
          onChange={(date) => setSelectedDate(date?.format("YYYY-MM-DD") || "")}
          value={dayjs(selectedDate)}
          format="YYYY-MM-DD"
          className="mb-4 h-10 w-full max-w-sm"
          placeholder="اختر التاريخ"
          suffixIcon={<CalendarOutlined />}
          allowClear={false}
        />
      </div>

      {isFetching && <Loading />}

      {!isFetching && (
        <Table
          dataSource={records?.data}
          columns={columns}
          rowKey="id"
          pagination={tablePaginationConfig({
            total: records?.count,
            current: records?.page,
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
          className="clickable-table minsk-header"
          onRow={(record) => ({
            onClick: () =>
              navigate(`/financials/${financialType}s/${record.id}`),
          })}
        />
      )}
    </>
  );
};

export default FinancialRecords;
