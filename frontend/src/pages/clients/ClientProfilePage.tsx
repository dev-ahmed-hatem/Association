import { useEffect, useState } from "react";
import { Card, Avatar, Tabs, Button, Switch, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import JopDetails from "@/components/clients/JopDetails";
import PersonalInfo from "@/components/clients/PersonalInfo";
import ClientNotes from "@/components/clients/ClientNotes";
import { useParams } from "react-router";
import Loading from "@/components/Loading";
import ErrorPage from "../Error";
import { useNavigate } from "react-router";
import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";
import { useAppDispatch } from "@/app/redux/hooks";
import { useNotification } from "@/providers/NotificationProvider";
import {
  clientsEndpoints,
  useClientMutation,
  useDeleteFinancialRecordsMutation,
  useGetClientQuery,
  useSwitchClientActiveMutation,
} from "@/app/api/endpoints/clients";
import { Client } from "@/types/client";
import SubscriptionHistory from "@/components/clients/SubscriptionHistory";
import InstallmentsHistory from "@/components/clients/InstallmentsHistory";
import LoansHistory from "@/components/clients/LoansHistory";
import { usePermission } from "@/providers/PermissionProvider";
import { TabsProps } from "antd/lib";

const ClientProfilePage: React.FC = () => {
  const { can } = usePermission();
  const navigate = useNavigate();
  const notification = useNotification();
  const { client_id } = useParams();
  const {
    data: client,
    isFetching,
    isError,
    error: clientError,
  } = useGetClientQuery({ id: client_id as string, format: "detailed" });
  const [
    switchActive,
    { data: switchRes, isLoading: switching, isError: switchError },
  ] = useSwitchClientActiveMutation();
  const [
    deleteFianancialRecords,
    {
      isLoading: deletingFinancialRecords,
      isError: financialRecordsError,
      isSuccess: deletedFinancialRecords,
    },
  ] = useDeleteFinancialRecordsMutation();
  const [
    deleteClient,
    {
      isError: deleteIsError,
      error: deleteError,
      isLoading: deleting,
      isSuccess: deleted,
    },
  ] = useClientMutation();

  const dispatch = useAppDispatch();

  const [isActive, setIsActive] = useState<boolean | null>(null);

  const toggleStatus = () => {
    switchActive(client_id as string);
  };

  const handleDeleteFinancialRecords = () => {
    deleteFianancialRecords(client_id as string);
  };

  const handleDelete = () => {
    deleteClient({
      url: `/clients/clients/${client_id}/`,
      method: "DELETE",
      data: {},
    });
  };

  const items = () => {
    const tabItems: TabsProps["items"] = [];

    if (can("clients.view"))
      tabItems.push(
        ...[
          {
            label: `التفاصيل الوظيفية`,
            key: "1",
            children: <JopDetails client={client!} />,
          },
          {
            label: `المعلومات الشخصية`,
            key: "2",
            children: <PersonalInfo client={client!} />,
          },
          {
            label: `ملاحظات`,
            key: "3",
            children: <ClientNotes client={client!} />,
          },
        ]
      );

    if (can("subscriptions.view"))
      tabItems.push({
        label: "الاشتراكات الشهرية",
        key: "4",
        children: (
          <SubscriptionHistory
            client_name={client!.name}
            client_id={client!.id}
            subscription_date={client!.subscription_date}
            is_active={client!.is_active}
            rank_fee={client!.rank_fee}
          />
        ),
      });

    if (can("installments.view"))
      tabItems.push({
        label: `الأقساط`,
        key: "5",
        children: (
          <InstallmentsHistory
            client_id={client!.id}
            subscription_fee={client!.subscription_fee}
            prepaid={client!.prepaid}
          />
        ),
      });

    if (can("loans.view"))
      tabItems.push({
        label: `القروض`,
        key: "6",
        children: <LoansHistory client_id={client!.id} />,
      });

    return tabItems;
  };

  useEffect(() => {
    if (client) setIsActive(client.is_active);
  }, [client]);

  useEffect(() => {
    if (switchError) {
      notification.error({
        message: "حدث خطأ في تغيير الحالة ! برجاء إعادة المحاولة",
      });
    }
  }, [switchError]);

  useEffect(() => {
    if (financialRecordsError) {
      notification.error({
        message: "حدث خطأ أثناء حذف المعاملات المالية ! برجاء إعادة المحاولة",
      });
    }
  }, [financialRecordsError]);

  useEffect(() => {
    if (deletedFinancialRecords) {
      notification.success({
        message: "تم حذف المعاملات المالية لهذا العضو",
      });
    }
  }, [deletedFinancialRecords]);

  useEffect(() => {
    if (switchRes) {
      if (client) setIsActive(switchRes.is_active);
      dispatch(
        clientsEndpoints.util.updateQueryData(
          "getClient",
          { id: client_id as string, format: "detailed" },
          (draft: Client) => {
            draft.is_active = switchRes.is_active;
          }
        )
      );
      notification.success({
        message: "تم تغيير الحالة بنجاح",
      });
    }
  }, [switchRes]);

  useEffect(() => {
    if (deleteIsError) {
      let message = (deleteError as axiosBaseQueryError)?.data.detail ?? null;
      notification.error({
        message: message ?? "حدث خطأ أثناء حذف العضو ! برجاء إعادة المحاولة",
      });
    }
  }, [deleteIsError]);

  useEffect(() => {
    if (deleted) {
      notification.success({
        message: "تم حذف العضو بنجاح",
      });

      navigate("/clients");
    }
  }, [deleted]);

  if (isFetching) return <Loading />;
  if (isError) {
    const error_title =
      (clientError as axiosBaseQueryError).status === 404
        ? "عضو غير موجود! تأكد من كود العضو المدخل."
        : undefined;

    return (
      <ErrorPage subtitle={error_title} reload={error_title === undefined} />
    );
  }
  return (
    <>
      {/* Client Header */}
      <Card className="shadow-lg rounded-xl">
        <div className="flex items-center justify-between flex-wrap gap-y-6">
          {/* Avatar with Fallback */}
          <div className="flex items-center flex-wrap gap-4">
            <Avatar size={80} className="bg-blue-700 font-semibold">
              {client!.membership_number}
            </Avatar>

            <div>
              <h2 className="text-xl font-bold">
                {client!.rank} / {client!.name}
              </h2>
              <p className="text-gray-500">{client!.seniority}</p>
            </div>
          </div>

          {/* Status */}
          {isActive !== null && (
            <div className="flex items-center gap-2">
              {can("clients.edit") && (
                <Switch
                  checked={isActive!}
                  onChange={toggleStatus}
                  checkedChildren="بالخدمة"
                  unCheckedChildren="متقاعد"
                  loading={switching}
                />
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Tabs Section */}
      <Tabs
        renderTabBar={(props, DefaultTabBar) => (
          <DefaultTabBar {...props} className="md:ps-2" />
        )}
        className="mt-4"
        direction="rtl"
        items={items()}
      />

      <div className="flex justify-between mt-2 flex-wrap gap-2">
        {/* Meta Data */}
        <div className="flex gap-1 flex-col text-sm">
          <div>
            <span className="font-medium text-gray-700" dir="rtl">
              تاريخ الإضافة:{" "}
            </span>
            {client!.created_at}
          </div>
          <div>
            <span className="font-medium text-gray-700">بواسطة: </span>
            {client!.created_by || "غير مسجل"}
          </div>
        </div>

        {/* Action Button */}
        <div className="btn-wrapper flex md:justify-end mt-4 flex-wrap gap-4">
          {can("clients.edit") && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                navigate(`/clients/edit/${client_id}`);
              }}
            >
              تعديل البيانات
            </Button>
          )}

          {can("incomes.delete") && (
            <Popconfirm
              title="هل أنت متأكد من حذف المعاملات المالية لهذا العضو؟"
              onConfirm={handleDeleteFinancialRecords}
              okText="نعم"
              cancelText="لا"
            >
              <Button
                className="enabled:bg-orange-500 enabled:border-orange-500 enabled:shadow-[0_2px_0_rgba(0,58,58,0.31)]
              enabled:hover:border-orange-400 enabled:hover:bg-orange-400 enabled:text-white"
                icon={<DeleteOutlined />}
                loading={deletingFinancialRecords}
              >
                حذف المعاملات المالية
              </Button>
            </Popconfirm>
          )}

          {can("clients.delete") && (
            <Popconfirm
              title="هل أنت متأكد من حذف هذا العضو؟"
              onConfirm={handleDelete}
              okText="نعم"
              cancelText="لا"
            >
              <Button
                className="enabled:bg-red-500 enabled:border-red-500 enabled:shadow-[0_2px_0_rgba(0,58,58,0.31)]
            enabled:hover:border-red-400 enabled:hover:bg-red-400 enabled:text-white"
                icon={<DeleteOutlined />}
                loading={deleting}
              >
                حذف العضو
              </Button>
            </Popconfirm>
          )}
        </div>
      </div>
    </>
  );
};

export default ClientProfilePage;
