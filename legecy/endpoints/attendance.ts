import {
  Attendance,
  AttendanceSettings,
  AttendanceSummary,
} from "@/types/attendance";
import api from "../apiSlice";
import qs from "query-string";
import { PaginatedResponse } from "@/types/paginatedResponse";

export const attendanceEndpoints = api.injectEndpoints({
  endpoints: (builder) => ({
    getDayAttendance: builder.query<Attendance[], Record<string, any> | void>({
      query: (params) => ({
        url: `attendance/attendance/?${qs.stringify(params || {})}`,
        method: "GET",
      }),
      providesTags: (results, error, arg) =>
        results
          ? [
              ...results.map((attendance) => ({
                type: "Attendance" as const,
                id: `${arg?.date ?? "unprovided"}${attendance.id}`,
              })),
              { type: "Attendance", id: arg?.date || "LIST" },
            ]
          : [{ type: "Attendance", id: arg?.date || "LIST" }],
    }),
    updateDayAttendance: builder.mutation<
      void,
      {
        date: string;
        records: any;
      }
    >({
      query: (data) => ({
        url: "attendance/update-day-attendance/?",
        method: "POST",
        data,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Attendance", id: arg.date ?? "LIST" },
      ],
    }),
    deleteAttendanceRecord: builder.mutation<void, string>({
      query: (id) => ({
        url: `/attendance/attendance/${id}/`,
        method: "DELETE",
      }),
      // tags invalidation will be applied manually within the component
    }),
    getAttendanceSummary: builder.query<
      PaginatedResponse<AttendanceSummary>,
      string
    >({
      query: (date) => ({
        url: `attendance/get-attendance-summary/?date=${date}`,
        method: "GET",
      }),
      providesTags: (result, error, arg) =>
        result
          ? [
              ...result.data.map((attendance) => ({
                type: "Attendance" as const,
                id: `${arg ?? "unprovided"}${attendance.id}`,
              })),
              { type: "Attendance", id: arg || "LIST" },
            ]
          : [{ type: "Attendance", id: arg || "LIST" }],
    }),
    // attendance settings queries
    getAttendanceSettings: builder.query<AttendanceSettings, void>({
      query: () => ({
        url: "attendance/attendance-settings/",
        method: "GET",
      }),
      providesTags: [{ type: "Attendance", id: "settings" }],
    }),
    updateAttendanceSettings: builder.mutation<AttendanceSettings, object>({
      query: (data) => ({
        url: "attendance/attendance-settings/",
        method: "PATCH",
        data
      }),
    }),
  }),
});

export const {
  useGetDayAttendanceQuery,
  useGetAttendanceSummaryQuery,
  useUpdateDayAttendanceMutation,
  useDeleteAttendanceRecordMutation,
  useGetAttendanceSettingsQuery,
  useUpdateAttendanceSettingsMutation,
} = attendanceEndpoints;
