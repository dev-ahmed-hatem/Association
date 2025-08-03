import { Tabs } from "antd";
import AttendanceRecords from "../../components/attendance/AttendanceRecords";
import AttendanceSummary from "../../components/attendance/AttendanceSummary";
import AttendanceSettings from "../../components/attendance/settings/AttendanceSettings";

const AttendancePage: React.FC = () => {
  const tabItems = [
    {
      key: "1",
      label: "دفتر الحضور",
      children: <AttendanceRecords />,
    },
    {
      key: "2",
      label: "ملخص الحضور",
      children: <AttendanceSummary />,
    },
    {
      key: "3",
      label: "إعدادات",
      children: <AttendanceSettings />,
    },
  ];

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">الحضور والانصراف</h1>
      <Tabs defaultActiveKey="1" items={tabItems} direction="rtl" />
    </>
  );
};

export default AttendancePage;
