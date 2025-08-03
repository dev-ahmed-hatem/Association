import OfficialTimes from "./sections/OfficialTimes";
import WorkSchedules from "./sections/WorkSchedules";
import Holidays from "./sections/Holidays";
import EmergencyDays from "./sections/EmergencyDays";
import { createContext } from "react";
import { AttendanceSettings as AttendanceSettingsType } from "@/types/attendance";
import {
  useGetAttendanceSettingsQuery,
  useUpdateAttendanceSettingsMutation,
} from "@/app/api/endpoints/attendance";
import Error from "@/pages/Error";
import Loading from "@/components/Loading";

interface AttendanceContextType {
  settings: AttendanceSettingsType;
  updateTrigger: Function;
  updating: boolean;
}

export const AttendanceContext = createContext<
  AttendanceContextType | undefined
>(undefined);

const AttendanceSettings = () => {
  const { data, isLoading, isError } = useGetAttendanceSettingsQuery();

  const [
    updateTrigger,
    { data: updated, isLoading: updating, isSuccess: updateSuccess },
  ] = useUpdateAttendanceSettingsMutation();

  if (isLoading) return <Loading />;
  if (isError) {
    return (
      <Error subtitle={"حدث خطأ أثناء تحميل إعدادات الحضور"} reload={true} />
    );
  }
  return (
    <AttendanceContext.Provider
      value={{ settings: data!, updateTrigger, updating }}
    >
      {/* Section 1: Official Times */}
      <OfficialTimes />

      {/* Section 2: Work Schedule */}
      <WorkSchedules />

      {/* Section 3: Holidays */}
      <Holidays />

      {/* Section 4: Emergency Attendance Days */}
      <EmergencyDays />
    </AttendanceContext.Provider>
  );
};

export default AttendanceSettings;
