import { useEffect, useState } from "react";
import { Form, Table, DatePicker, Statistic, Tag } from "antd";
import { PlusOutlined, CalendarOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { Link, Outlet, useMatch, useNavigate } from "react-router";
import {
  expensePaymentMethods,
  FinancialRecord,
  incomePaymentMethods,
  paymentMethodColors,
} from "@/types/financial_record";
import { tablePaginationConfig } from "../../utils/antd";
import { ColumnsType } from "antd/es/table";
import { TransactionKindArabic } from "@/types/transaction_type";
import { useLazyGetFinancialRecordsQuery } from "@/app/api/endpoints/financial_records";
import Loading from "@/components/Loading";
import ErrorPage from "../Error";
import { PaginatedResponse } from "@/types/paginatedResponse";
import { useGetTransactionTypesQuery } from "@/app/api/endpoints/transaction_types";
import { SortOrder } from "antd/lib/table/interface";
import { usePermission } from "@/providers/PermissionProvider";
import { useGetBankAccountsQuery } from "@/app/api/endpoints/bank_accounts";
import { BankAccount } from "@/types/bank_account";

const { RangePicker } = DatePicker;

type Props = {
  financialType: "income" | "expense";
};

type ControlsType = {
  sort_by?: string;
  order?: SortOrder;
  filters: {
    payment_method?: string;
    transaction_type?: string;
    bank_account?: string;
  };
} | null;

const FinancialRecords: React.FC<Props> = ({ financialType }) => {
  const { can, hasModulePermission } = usePermission();
  const [form] = Form.useForm();
  const isFinancials = useMatch(`/financials/${financialType}s`);
  const [fromDate, setFromDate] = useState<Dayjs>(dayjs());
  const [toDate, setToDate] = useState<Dayjs>(dayjs());
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

  const {
    data: accounts,
    isFetching: accountsLoading,
    isError: accountsError,
  } = useGetBankAccountsQuery({ no_pagination: true });

  const [
    getRecords,
    { data: financialRecords, isLoading, isFetching, isError },
  ] = useLazyGetFinancialRecordsQuery();
  const records = financialRecords as PaginatedResponse<FinancialRecord>;

  const columns: ColumnsType<FinancialRecord> = [
    {
      title: "#",
      key: "index",
      render: (_: any, __: any, index: number) =>
        (page ? (page - 1) * pageSize : 0) + index + 1,
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
      render: (text, record) => (
        <span>
          {record.transaction_type.name}{" "}
          {record.project && `(${record.project.name})`}
        </span>
      ),
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
      filters:
        financialType === "income"
          ? incomePaymentMethods.map((method) => ({
              text: method,
              value: method,
            }))
          : expensePaymentMethods.map((method) => ({
              text: method,
              value: method,
            })),
      defaultFilteredValue: controls?.filters?.payment_method?.split(","),
    },
    {
      title: "البنك",
      dataIndex: "bank_account",
      key: "bank_account",
      render: (text: BankAccount) => (text ? text.name : "-"),
      filters: accounts?.map((bank) => ({
        text: bank.name,
        value: bank.name,
      })),
      defaultFilteredValue: controls?.filters?.bank_account?.split(","),
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
      sortOrder:
        controls?.sort_by === "amount" ? controls?.order ?? null : null,
    },
  ];

  useEffect(() => {
    if (isFinancials) {
      getRecords({
        no_pagination: false,
        type: TransactionKindArabic[financialType],
        page,
        page_size: pageSize,
        from: fromDate.format("YYYY-MM-DD"),
        to: toDate.format("YYYY-MM-DD"),
        sort_by: controls?.sort_by,
        order: controls?.order === "descend" ? "-" : "",
        payment_methods: controls?.filters.payment_method,
        transaction_types: controls?.filters.transaction_type,
        bank_accounts: controls?.filters.bank_account,
      });
    }
  }, [page, pageSize, fromDate, toDate, financialType, controls]);

  if (!isFinancials) return <Outlet />;

  if (isLoading || typesLoading || accountsLoading) return <Loading />;
  if (isError || typesIsError || accountsError) return <ErrorPage />;
  if (
    (financialType === "income" && !hasModulePermission("incomes")) ||
    (financialType === "expense" && !hasModulePermission("expenses"))
  )
    return (
      <ErrorPage
        title="ليس لديك صلاحية للوصول إلى هذه الصفحة"
        subtitle="يرجى التواصل مع مدير النظام للحصول على الصلاحيات اللازمة."
        reload={false}
      />
    );
  return (
    <>
      <h1 className="mb-6 text-2xl md:text-3xl font-bold">{pageTitle}</h1>

      <div className="flex justify-end flex-wrap gap-2 mb-4">
        {((financialType === "income" && can("incomes.add")) ||
          (financialType === "expense" && can("expenses.add"))) && (
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
        )}
      </div>

      <div className="flex justify-between flex-wrap gap-2">
        {((financialType === "income" && can("incomes.view")) ||
          (financialType === "expense" && can("expenses.view"))) && (
          <Form
            form={form}
            layout="inline"
            className="mb-6 flex-wrap gap-4"
            initialValues={{
              from: fromDate,
              to: toDate,
            }}
          >
            <Form.Item
              name="from"
              label="من"
              rules={[{ required: true, message: "يرجى اختيار تاريخ البداية" }]}
            >
              <DatePicker
                value={fromDate}
                onChange={(date) => setFromDate(date)}
                format="YYYY-MM-DD"
                placeholder="اختر تاريخ البداية"
                className="w-44"
              />
            </Form.Item>

            <Form.Item
              name="to"
              label="إلى"
              dependencies={["from"]}
              rules={[
                { required: true, message: "يرجى اختيار تاريخ النهاية" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || !getFieldValue("from")) {
                      return Promise.resolve();
                    }
                    if (value.isBefore(getFieldValue("from"))) {
                      return Promise.reject(
                        new Error("تاريخ النهاية يجب أن يكون بعد تاريخ البداية")
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <DatePicker
                value={toDate}
                onChange={(date) => setToDate(date)}
                format="YYYY-MM-DD"
                placeholder="اختر تاريخ النهاية"
                className="w-44"
              />
            </Form.Item>
          </Form>
        )}
      </div>

      {isFetching && <Loading />}

      {!isFetching &&
        ((financialType === "income" && can("incomes.view")) ||
          (financialType === "expense" && can("expenses.view"))) && (
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
