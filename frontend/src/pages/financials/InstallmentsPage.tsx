import { useEffect, useState } from "react";
import {
  Table,
  Tag,
  DatePicker,
  Button,
  Input,
  Popconfirm,
  Space,
  Avatar,
  InputNumber,
} from "antd";
import { EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";
import { getInitials, textify } from "@/utils";
import { Link } from "react-router";
import { Installment, NamedInstallment } from "@/types/installment";
import {
  useGetMonthInstallmentsQuery,
  useInstallmentMutation,
} from "@/app/api/endpoints/installments";
import Loading from "@/components/Loading";
import { rankColors } from "@/types/client";
import { useNotification } from "@/providers/NotificationProvider";
import { tablePaginationConfig } from "@/utils/antd";

const { MonthPicker } = DatePicker;

const InstallmentsPage = () => {
  const [selectedMonth, setSelectedMonth] = useState<Dayjs>(dayjs());
  const [installments, setInstallments] = useState<
    NamedInstallment[] | undefined
  >(undefined);
  const [message, setMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const notification = useNotification();

  const { data, isFetching, isError } = useGetMonthInstallmentsQuery({
    month: (selectedMonth.month() + 1).toString(),
    year: selectedMonth.year().toString(),
    search,
    page,
    page_size: pageSize,
  });

  const [
    handleInstallment,
    { isLoading, isError: recordError, isSuccess: recorded },
  ] = useInstallmentMutation();

  // Search
  const onSearch = (value: string) => setSearch(value);

  const markAsPaid = (record: Installment & { notes?: string }) => {
    const data = {
      paid_at: dayjs().format("YYYY-MM-DD"),
      amount: record.amount,
      notes: record.notes,
    };

    setMessage("تم تسجيل القسط");
    handleInstallment({
      data,
      url: `/financials/installments/${record.id}/payment/`,
      method: "PATCH",
    });
  };

  const editRecord = (
    record: Installment,
    field: "notes" | "amount",
    value: any
  ) => {
    setInstallments((prev) =>
      prev?.map((item) =>
        item.id === record.id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleRevoke = (id: number) => {
    setMessage("تم إلغاء الدفع");
    handleInstallment({
      url: `/financials/installments/${id}/revoke/`,
      method: "PATCH",
    });
  };

  const columns: ColumnsType<NamedInstallment> = [
    {
      title: "اسم العضو",
      dataIndex: "client",
      key: "client",
      render: (text, record) => (
        <Space>
          <Avatar className="bg-gradient-to-br from-[#1d4ed8] to-[#2563eb] text-white font-semibold">
            {getInitials(text)}
          </Avatar>
          <span className="flex flex-col">
            <Link
              to={`/clients/client-profile/${record.client_id}/`}
              className="name text-base font-bold hover:underline hover:text-blue-700"
            >
              {text}
            </Link>
            <div className="id text-xs text-gray-400">
              <span>{record.membership_number}#</span>{" "}
              <Tag className="text-sm m-2" color={rankColors[record.rank]}>
                {record.rank}
              </Tag>
            </div>
          </span>
        </Space>
      ),
    },
    {
      title: "رقم القسط",
      dataIndex: "installment_number",
      key: "installment_number",
    },
    {
      title: "قيمة القسط",
      dataIndex: "amount",
      key: "amount",
      render: (value, record) =>
        record.status === "مدفوع" ? (
          <span>{value}</span>
        ) : (
          <InputNumber
            value={value}
            onChange={(value) => editRecord(record, "amount", value)}
          />
        ),
    },
    {
      title: "الحالة",
      dataIndex: "status",
      key: "status",
      render: (value) => (
        <Tag color={value === "مدفوع" ? "green" : "red"}>{value}</Tag>
      ),
    },
    {
      title: "ملاحظات",
      dataIndex: "notes",
      key: "notes",
      render: (value, record) =>
        record.status === "مدفوع" ? (
          <span>{textify(value) ?? "-"}</span>
        ) : (
          <Input
            value={value}
            onChange={(event) =>
              editRecord(record, "notes", event.target.value)
            }
          />
        ),
    },
    {
      title: "تاريخ الدفع",
      dataIndex: "paid_at",
      key: "paid_at",
      render: (value?: string) => (
        <span className="text-minsk font-bold">{value ?? "-"}</span>
      ),
    },
    {
      title: "إجراءات",
      key: "actions",
      render: (_, record) =>
        record.status === "مدفوع" ? (
          <Space>
            <Link to={`/financials/incomes/${record.financial_record}/`}>
              <Button
                type="primary"
                size="middle"
                icon={<EyeOutlined />}
                title="عرض"
                disabled={isLoading}
              />
            </Link>

            <Popconfirm
              title="تأكيد الحذف"
              description="هل أنت متأكد أنك تريد حذف هذا السجل؟"
              okText="نعم"
              cancelText="إلغاء"
              onConfirm={() => handleRevoke(record.id)}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                size="middle"
                className="hover:bg-red-600 hover:border-red-600 hover:text-white"
                title="حذف"
                disabled={isLoading}
              />
            </Popconfirm>
          </Space>
        ) : (
          <Popconfirm
            title="تأكيد الدفع"
            description="تأكيد الدفع بتاريخ اليوم؟"
            okText="تأكيد"
            cancelText="إلغاء"
            placement="top"
            onConfirm={() => markAsPaid(record)}
            disabled={isLoading}
          >
            <Button type="primary" loading={isLoading}>
              تسجيل كمدفوع
            </Button>
          </Popconfirm>
        ),
    },
  ];

  useEffect(() => {
    setInstallments(data?.data);
  }, [data]);

  useEffect(() => {
    if (recorded) {
      notification.success({
        message: message ?? "تم التنفيذ",
      });
    }
  }, [recorded]);

  useEffect(() => {
    if (recordError) {
      notification.error({
        message: "حدث خطأ أثناء التنفيذ! برجاء إعادة المحاولة",
      });
    }
  }, [recordError]);

  return (
    <div className="space-y-6">
      {/* Gradient header - changed to blue-green theme */}
      <div className="bg-gradient-to-r from-blue-600 via-cyan-500 to-green-500 rounded-2xl p-6 shadow-lg text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          سجل الأقساط - {dayjs(selectedMonth).format("MMMM YYYY")}
        </h1>
        <p className="text-white/90 mt-2">
          عرض حالة الأقساط لجميع الأعضاء للشهر المحدد
        </p>
      </div>

      {/* Controls */}
      <div>
        <MonthPicker
          value={selectedMonth}
          onChange={(date) => date && setSelectedMonth(date)}
          placeholder="اختر الشهر"
          className="w-full max-w-md"
        />
      </div>

      <div>
        <Input.Search
          placeholder="ابحث عن عضو..."
          onSearch={onSearch}
          className="mb-4 w-full max-w-md h-10"
          defaultValue={search}
          allowClear={true}
          onClear={() => setSearch("")}
        />
      </div>

      {isFetching && <Loading />}

      {isError && (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="text-red-500 text-2xl mb-2">⚠️</div>
          <p className="text-lg font-semibold text-red-600">حدث خطأ</p>
          <p className="text-gray-500 text-sm">يرجى إعادة المحاولة لاحقًا</p>
        </div>
      )}

      {/* Table */}
      {!isFetching && (
        <Table
          dataSource={installments}
          columns={columns}
          rowKey="id"
          bordered
          pagination={tablePaginationConfig({
            total: data?.count,
            current: data?.page,
            showQuickJumper: true,
            pageSize,
            onChange(page, pageSize) {
              setPage(page);
              setPageSize(pageSize);
            },
          })}
          scroll={{ x: "max-content" }}
          className="minsk-header"
        />
      )}
    </div>
  );
};

export default InstallmentsPage;
