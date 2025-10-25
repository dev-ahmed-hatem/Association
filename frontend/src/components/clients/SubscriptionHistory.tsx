import {
  Table,
  DatePicker,
  Space,
  Button,
  InputNumber,
  Tag,
  Input,
  Popconfirm,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { SubscriptionDisplay } from "@/types/subscription";
import {
  useGetYearSubscriptionsQuery,
  useSubscriptionMutation,
} from "@/app/api/endpoints/subscriptions";
import { textify } from "@/utils";
import Loading from "../Loading";
import { useNotification } from "@/providers/NotificationProvider";
import { Link } from "react-router";
import { usePermission } from "@/providers/PermissionProvider";

const SubscriptionHistory = ({
  client_id,
  subscription_date,
  is_active,
  rank_fee,
}: {
  client_id: string;
  subscription_date: string;
  is_active: boolean;
  rank_fee: number;
}) => {
  const { can } = usePermission();
  const [selectedYear, setSelectedYear] = useState<Dayjs>(dayjs());
  const subscriptionDateObj = dayjs(subscription_date, "YYYY-MM-DD");
  const notification = useNotification();
  const [message, setMessage] = useState<string | null>(null);

  const {
    data: paid,
    isFetching,
    isError,
    isSuccess,
  } = useGetYearSubscriptionsQuery({
    client: client_id,
    year: selectedYear.year(),
  });
  const [
    handleSubscription,
    { isLoading, isError: recordError, isSuccess: recorded },
  ] = useSubscriptionMutation();

  // Generate monthly salary data for the selected year
  const getYearSalaryData = (): SubscriptionDisplay[] => {
    let yearData: SubscriptionDisplay[] = [];

    const monthsStart =
      selectedYear.year() < subscriptionDateObj.year()
        ? 100 // any large number to invalidate the loop condition
        : selectedYear.year() === subscriptionDateObj.year()
        ? subscriptionDateObj.add(1, "month").month()
        : 0;

    const monthsCount =
      dayjs().year() === selectedYear.year() ? selectedYear.month() + 1 : 12;

    for (let i = monthsStart; i < monthsCount; i++) {
      const month = selectedYear.startOf("year").add(i, "month");

      const paidMonth = paid?.[i + 1];

      if (paidMonth) {
        yearData.push({
          id: paidMonth.id,
          date: paidMonth.date,
          status: "مدفوع",
          notes: paidMonth.notes,
          paid_at: paidMonth.paid_at,
          amount: paidMonth.amount,
        });
      } else if (is_active) {
        yearData.push({
          id: i.toString(),
          date: month,
          status: "غير مدفوع",
          notes: "",
          paid_at: "",
          amount: rank_fee,
        });
      }
    }
    return yearData;
  };

  const [subscriptions, setSubscriptions] = useState<SubscriptionDisplay[]>(
    getYearSalaryData()
  );

  // mark as paid
  const markAsPaid = (record: SubscriptionDisplay) => {
    const data = {
      amount: record.amount,
      date: (record.date as Dayjs).startOf("month").format("YYYY-MM-DD"),
      notes: record.notes,
      paid_at: dayjs().format("YYYY-MM-DD"),
      client: client_id,
    };
    setMessage("تم تسجيل الاشتراك");
    handleSubscription({ data });
  };

  const editRecord = (
    record: SubscriptionDisplay,
    field: "notes" | "amount",
    value: any
  ) => {
    setSubscriptions((prev) =>
      prev.map((item) =>
        item.date === record.date ? { ...item, [field]: value } : item
      )
    );
  };

  const handleDelete = (id: string) => {
    setMessage("تم حذف الاشتراك");
    handleSubscription({
      url: `/financials/subscriptions/${id}/`,
      method: "DELETE",
    });
  };

  // Table columns
  const columns: ColumnsType<SubscriptionDisplay> = [
    {
      title: "الشهر",
      dataIndex: "date",
      key: "date",
      render: (value: string | Dayjs) =>
        typeof value === "string" ? value : value.format("YYYY-MM"),
    },
    {
      title: "قيمة الاشتراك",
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
            {can("subscriptions.delete") && (
              <Popconfirm
                title="تأكيد الحذف"
                description="هل أنت متأكد أنك تريد حذف هذا السجل؟"
                okText="نعم"
                cancelText="إلغاء"
                onConfirm={() => handleDelete(record.id)}
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
            )}
          </Space>
        ) : (
          <>
            {can("subscriptions.add") && (
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
            )}
          </>
        ),
    },
  ];

  useEffect(() => {
    setSubscriptions(getYearSalaryData());
  }, [selectedYear, paid]);

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
        message: "حدث خطأ أثناء التنفيذ ! برجاء إعادة المحاولة",
      });
    }
  }, [recordError]);

  useEffect(() => {
    if (isError) {
      notification.error({
        message: "حدث خطأ أثناء تحميل البيانات ! برجاء إعادة المحاولة",
      });
    }
  }, [isError]);

  return (
    <div>
      {/* Year Picker */}
      <Space
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <DatePicker
          picker="year"
          onChange={(date) => setSelectedYear(date || dayjs())}
          value={selectedYear}
          format="[السنة ]YYYY"
          placeholder="اختر السنة"
          className="w-full md:w-60"
          disabledDate={(date) =>
            date.year() > dayjs().year() ||
            date.year() < subscriptionDateObj.year()
          }
          disabled={isFetching}
          allowClear={false}
        />
      </Space>

      {isFetching && <Loading />}

      {isError && (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="text-red-500 text-2xl mb-2">⚠️</div>
          <p className="text-lg font-semibold text-red-600">حدث خطأ</p>
          <p className="text-gray-500 text-sm">يرجى إعادة المحاولة لاحقًا</p>
        </div>
      )}

      {/* Subscription Table */}
      {isSuccess && subscriptions && (
        <Table
          dataSource={subscriptions}
          columns={columns}
          rowKey="date"
          pagination={false}
          bordered
          title={() =>
            `سجل الاشتراكات - سنة ${dayjs(selectedYear).format("YYYY")}`
          }
          scroll={{ x: "max-content" }}
          className="minsk-header"
        />
      )}
    </div>
  );
};

export default SubscriptionHistory;
