import { useState } from "react";
import { Table, DatePicker, Card } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { tablePaginationConfig } from "../../utils/antd";
import { ColumnType } from "antd/lib/table";
import { AttendanceSummary as AttendanceSummaryType } from "@/types/attendance";
import { useGetAttendanceSummaryQuery } from "@/app/api/endpoints/attendance";
import Loading from "../Loading";
import Error from "@/pages/Error";

const columns: ColumnType<AttendanceSummaryType>[] = [
  {
    title: "الموظف",
    dataIndex: "employee",
    key: "employee",
  },
  {
    title: "وقت الحضور",
    dataIndex: "check_in",
    key: "check_in",
  },
  {
    title: "وقت الانصراف",
    dataIndex: "check_out",
    key: "check_out",
  },
  {
    title: "الخصم (دقائق)",
    dataIndex: "deductions",
    key: "deductions",
    render: (value) =>
      value ? `${value} ${value < 11 && value > 2 ? "دقائق" : "دقيقة"}` : "-",
  },
  {
    title: "الإضافي (دقائق)",
    dataIndex: "extra",
    key: "extra",
    render: (value) =>
      value ? `${value} ${value < 11 && value > 2 ? "دقائق" : "دقيقة"}` : "-",
  },
];

const AttendanceSummary = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

  const {
    data: records,
    isLoading,
    isFetching,
    isError,
  } = useGetAttendanceSummaryQuery(selectedDate.format("YYYY-MM-DD"));

  if (isLoading) return <Loading />;
  if (isError) return <Error />;
  return (
    <Card title="ملخص الحضور" className="shadow-lg rounded-xl">
      <div className="flex items-center gap-4 mb-4">
        <span className="font-semibold">اختر اليوم:</span>
        <DatePicker
          value={selectedDate}
          onChange={setSelectedDate}
          format="YYYY-MM-DD"
        />
      </div>
      {isFetching ? (
        <Loading />
      ) : (
        <Table
          dataSource={records?.data}
          columns={columns}
          pagination={tablePaginationConfig()}
          rowKey="id"
          className="calypso-header"
          scroll={{ x: "max-content" }}
        />
      )}
    </Card>
  );
};

export default AttendanceSummary;
