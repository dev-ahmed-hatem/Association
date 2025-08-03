import React from "react";
import { Calendar as AntdCalendar } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";
import { SelectInfo } from "antd/es/calendar/generateCalendar";
import LatestEvents from "./LatestEvents";

const Calendar: React.FC = () => {
  const [dateSelected, setDateSelected] = useState<string>(
    dayjs().format("YYYY-MM-DD")
  );

  const onSelect = (value: Dayjs, selectInfo: SelectInfo) => {
    setDateSelected(value.format("YYYY-MM-DD"));
  };

  return (
    <>
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">
        جدول المواعيد
      </h2>
      <div className="w-full flex max-md:flex-col justify-between gap-4">
        <div className="md:w-1/2 lg:max-w-xl border rounded-lg border-calypso-800 p-2">
          <AntdCalendar fullscreen={false} onSelect={onSelect} />
        </div>
        <LatestEvents dateSelected={dateSelected} />
      </div>
    </>
  );
};

export default Calendar;
