import { useEffect, useState } from "react";
import { Card, Avatar, Tabs, Button, Switch, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { getInitials } from "../../utils";
import { Employee } from "../../types/employee";
import JopDetails from "../../components/clients/JopDetails";
import PersonalInfo from "../../components/clients/PersonalInfo";
import Performance from "../../components/clients/Performance";
import Attendance from "../../components/clients/Attendance";
import SalaryHistory from "../../components/clients/SalaryHistory";
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
  useGetClientQuery,
  useSwitchClientActiveMutation,
} from "@/app/api/endpoints/clients";
import { Client } from "@/types/client";

// Sample Employee Data
const employee3: Employee = {
  id: 1,
  url: "http://127.0.0.1:8000/api/employees/employees/1/",
  department: "Social Media",
  gender: "ذكر",
  marital_status: "أعزب",
  mode: "عن بُعد",
  created_by: "Dev Ahmed Hatem",
  name: "Employee 1",
  email: "e@a.com",
  is_active: true,
  phone: "123",
  employee_id: "E12",
  address: "16 moharam bek",
  birth_date: "2000-07-22",
  age: 25,
  national_id: "123123",
  position: "Full Stack Developer",
  hire_date: "2023-12-02",
  cv: "http://127.0.0.1:8000/media/employees/cv/Screenshot_2025-03-18_221316.png",
  image: "http://127.0.0.1:8000/media/employees/images/6mouhk.png",
  created_at: "2025-05-08T14:31:02.935535Z",

  performance: {
    totalProjects: 15,
    activeProjects: 3,
    totalAssignments: 20,
    activeAssignments: 5,
  },

  attendance: [
    { date: "2025-03-10", check_in: "08:30 AM", check_out: "05:00 PM" },
    { date: "2025-03-11", check_in: "09:00 AM", check_out: "04:45 PM" },
    { date: "2025-03-12" }, // No record for this day
    { date: "2025-03-13", check_in: "07:45 AM", check_out: "05:30 PM" },
    { date: "2025-03-14" }, // No record
  ],

  salaryHistory: [
    { date: "2025-01", baseSalary: 15000, bonuses: 2000 },
    { date: "2025-02", baseSalary: 15000, bonuses: 1500 },
    { date: "2025-03", baseSalary: 15000, bonuses: 1800 },
  ],
};

const items = (client: Client) => [
  {
    label: `التفاصيل الوظيفية`,
    key: "1",
    children: <JopDetails client={client} />,
  },
  {
    label: `المعلومات الشخصية`,
    key: "2",
    children: <PersonalInfo client={client} />,
  },
  {
    label: `الأداء الوظيفي`,
    key: "3",
    children: <Performance performance={employee3.performance} />,
  },
  {
    label: `الحضور والانصراف`,
    key: "4",
    children: <Attendance attendance={employee3.attendance} />,
  },
  {
    label: `تاريخ الراتب`,
    key: "5",
    children: <SalaryHistory salaryHistory={employee3.salaryHistory} />,
  },
];

const ClientProfilePage: React.FC = () => {
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
    deleteEmployee,
    { isError: deleteError, isLoading: deleting, isSuccess: deleted },
  ] = useClientMutation();

  const dispatch = useAppDispatch();

  const [isActive, setIsActive] = useState<boolean | null>(null);

  const toggleStatus = () => {
    switchActive(client_id as string);
  };

  const handleDelete = () => {
    deleteEmployee({
      url: `/clients/clients/${client_id}/`,
      method: "DELETE",
      data: {},
    });
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
    if (deleteError) {
      notification.error({
        message: "حدث خطأ أثناء حذف العضو ! برجاء إعادة المحاولة",
      });
    }
  }, [deleteError]);

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
              <Switch
                checked={isActive!}
                onChange={toggleStatus}
                checkedChildren="نشط"
                unCheckedChildren="غير نشط"
                loading={switching}
              />
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
        items={items(client!)}
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
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              navigate(`/clients/edit/${client_id}`);
            }}
          >
            تحديث البيانات
          </Button>
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
        </div>
      </div>
    </>
  );
};

export default ClientProfilePage;
