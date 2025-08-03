import { Button, Card, InputNumber, TimePicker } from "antd";
import dayjs from "dayjs";
import { useContext, useState } from "react";
import { SaveOutlined } from "@ant-design/icons";
import { AttendanceContext } from "../AttendanceSettings";

const OfficialTimes = () => {
  const { settings, updateTrigger, updating } = useContext(AttendanceContext)!;
  const [standardCheckIn, setStandardCheckIn] = useState(settings?.check_in);
  const [standardCheckOut, setStandardCheckOut] = useState(settings?.check_out);
  const [gracePeriod, setGracePeriod] = useState<number | undefined>(
    settings?.grace_period
  );

  const handleUpdate = () => {
    updateTrigger({
      check_in: standardCheckIn,
      check_out: standardCheckOut,
      grace_period: gracePeriod,
    });
  };

  return (
    <Card title="المواعيد الرسمية" className="shadow-lg rounded-xl mb-8 pb-6">
      <div className="flex flex-wrap gap-6 md:gap-12 justify-between">
        <div className="flex flex-wrap gap-6 md:gap-12">
          <div className="flex gap-x-4 items-center">
            <span className="font-semibold">وقت الحضور الرسمي:</span>
            <TimePicker
              value={dayjs(standardCheckIn, "HH:mm")}
              format="HH:mm"
              onChange={(time) =>
                time && setStandardCheckIn(time.format("HH:mm"))
              }
            />
          </div>
          <div className="flex gap-x-4 items-center">
            <span className="font-semibold">وقت الانصراف الرسمي:</span>
            <TimePicker
              value={dayjs(standardCheckOut, "HH:mm")}
              format="HH:mm"
              onChange={(time) =>
                time && setStandardCheckOut(time.format("HH:mm"))
              }
            />
          </div>
          <div className="flex gap-x-4 items-center">
            <span className="font-semibold">فترة السماحية (دقائق):</span>
            <InputNumber
              min={0}
              value={gracePeriod}
              onChange={(value) => value !== null && setGracePeriod(value)}
            />
          </div>
        </div>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={() => handleUpdate()}
          loading={updating}
        >
          حفظ
        </Button>
      </div>
    </Card>
  );
};

export default OfficialTimes;
