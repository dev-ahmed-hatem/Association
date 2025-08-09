import React, { useState } from "react";
import { Card, Collapse, Tag, Typography, Space, Empty, Calendar } from "antd";
import {
  ClockCircleOutlined,
  DownOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { Link, Outlet, useMatch } from "react-router";
import { Schedule, ScheduleType } from "../../types/schedule";
import { CollapseProps } from "antd/lib";

const { Title } = Typography;

const exampleSchedules: Schedule[] = [
  {
    id: "1",
    title: "ورشة تدريب",
    type: "طوال اليوم",
    description: "ورشة تدريب لفريق الموارد البشرية",
    date: "2025-04-17",
  },
  {
    id: "2",
    title: "اجتماع قسم التقنية",
    type: "وقت محدد",
    time: "10:00",
    date: "2025-04-17",
  },
  {
    id: "3",
    title: "فترة صيانة",
    type: "فترة من اليوم",
    period: { start: "15:00", end: "18:00" },
    date: "2025-04-17",
  },
];

const SchedulesPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [schedules] = useState<Schedule[]>(exampleSchedules);
  const isSchedules = useMatch("/schedules");

  const renderTypeTag = (type: ScheduleType) => {
    switch (type) {
      case "طوال اليوم":
        return <Tag color="blue">طوال اليوم</Tag>;
      case "وقت محدد":
        return <Tag color="green">وقت محدد</Tag>;
      case "فترة من اليوم":
        return <Tag color="gold">فترة من اليوم</Tag>;
      default:
        return null;
    }
  };

  const items: CollapseProps["items"] = exampleSchedules.map((schedule) => ({
    key: schedule.id,
    label: (
      <Space direction="vertical" size={0}>
        <span className="font-semibold text-base mb-3 inline-block">
          {schedule.title}
        </span>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {renderTypeTag(schedule.type)}
          {schedule.type === "وقت محدد" && (
            <span className="text-gray-600 flex items-center gap-1">
              <ClockCircleOutlined />
              {schedule.time}
            </span>
          )}
          {schedule.type === "فترة من اليوم" && schedule.period && (
            <span className="text-gray-600">
              من {schedule.period.start} إلى {schedule.period.end}
            </span>
          )}
        </div>
      </Space>
    ),
    children: (
      <p className="text-sm text-gray-700">
        {schedule.description || "لا توجد تفاصيل إضافية."}
      </p>
    ),
  }));

  if (!isSchedules) return <Outlet />;
  return (
    <>
      <h1 className="mb-6 text-2xl md:text-3xl font-bold">جدول المواعيد</h1>

      <div className="flex justify-end flex-wrap mb-4">
        {/* Add Button */}
        <Link
          to={"/schedules/add"}
          className="h-10 px-6 flex items-center text-white gap-2 rounded-lg
         bg-green-700 hover:bg-green-600 shadow-[0_2px_0_rgba(0,58,58,0.31)]"
        >
          <PlusOutlined />
          <span>إضافة جدول</span>
        </Link>
      </div>

      {/* Controls */}
      <Card className="shadow-sm mb-8">
        <Title level={4} className="mb-4">
          اختر اليوم:
        </Title>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* <span className="font-medium whitespace-nowrap"></span> */}
            <Calendar
              fullscreen={false}
              value={selectedDate}
              onSelect={(date) => setSelectedDate(date)}
              className="w-full md:w-auto rtl"
            />
          </div>
        </div>
      </Card>

      {/* Schedule List */}
      <Card className="shadow-md">
        <Title level={4} className="mb-4">
          الجداول الخاصة بيوم {selectedDate.format("DD-MM-YYYY")}
        </Title>

        {schedules.length > 0 ? (
          <Collapse
            accordion
            expandIconPosition="end"
            expandIcon={({ isActive }) => (
              <DownOutlined rotate={isActive ? 180 : 0} />
            )}
            items={items}
          />
        ) : (
          <Empty description="لا توجد جداول لهذا اليوم" />
        )}
      </Card>
    </>
  );
};

export default SchedulesPage;
