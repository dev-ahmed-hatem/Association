import { Department } from "@/types/department";
import api from "../apiSlice";
import { Employee } from "@/types/employee";
import { PaginatedResponse } from "@/types/paginatedResponse";
import qs from "query-string";

export const employeesEndpoints = api.injectEndpoints({
  endpoints: (builder) => ({
    getAllEmployees: builder.query<Employee[], void>({
      query: () => ({
        url: `/employees/employees?no_pagination=true`,
        method: "GET",
      }),
    }),
    getEmployees: builder.query<
      PaginatedResponse<Employee>,
      Record<string, any> | void
    >({
      query: (params) => ({
        url: `/employees/employees?${qs.stringify(params || {})}`,
        method: "GET",
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((employee) => ({
                type: "Employee" as const,
                id: employee.id,
              })),
              { type: "Employee", id: "LIST" },
            ]
          : [{ type: "Employee", id: "LIST" }],
    }),
    getEmployee: builder.query<
      Employee,
      { id: string; format: "detailed" | "form_data" }
    >({
      query: ({ id, format }) => ({
        url: `/employees/employees/${id}/${format}/`,
        method: "GET",
      }),
      providesTags: (res, error, arg) => [{ type: "Employee", id: arg.id }],
    }),
    switchEmployeeActive: builder.mutation<{ is_active: boolean }, string>({
      query: (id) => ({
        url: `/employees/employees/${id}/switch_active/`,
        method: "GET",
      }),
      invalidatesTags: [{ type: "Employee", id: "LIST" }],
    }),
    employee: builder.mutation<
      Employee,
      { data: Partial<Employee>; method?: string; url?: string }
    >({
      query: ({ data, method, url }) => ({
        url: url || `employees/employees/`,
        method: method || "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        data,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Invalidate the Employee LIST tag on successful POST
          dispatch(
            api.util.invalidateTags([
              { type: "Employee", id: "LIST" },
              { type: "Employee", id: arg.data.id },
            ])
          );
        } catch {
          // Do nothing if the request fails
        }
      },
    }),
    deleteEmployee: builder.mutation<void, string>({
      query: (id) => ({
        url: `/employees/employees/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Employee", id: "LIST" }],
    }),
    deleteEmployees: builder.mutation<void, number[]>({
      query: (data) => ({
        url: `/employees/multiple-delete/`,
        method: "DELETE",
        data,
      }),
      invalidatesTags: [{ type: "Employee", id: "LIST" }],
    }),
    getPaginatedDepartments: builder.query<
      PaginatedResponse<Department>,
      Record<string, any> | void
    >({
      query: (params) => ({
        url: `/employees/departments?${qs.stringify(params || {})}`,
      }),
    }),
    getAllDepartments: builder.query<Department[], Record<string, any> | void>({
      query: (params) => ({
        url: `/employees/departments?no_pagination=true&${qs.stringify(
          params || {}
        )}`,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllEmployeesQuery,
  useGetEmployeesQuery,
  useGetEmployeeQuery,
  useSwitchEmployeeActiveMutation,
  useEmployeeMutation,
  useDeleteEmployeeMutation,
  useDeleteEmployeesMutation,
  useGetAllDepartmentsQuery,
  useGetPaginatedDepartmentsQuery,
} = employeesEndpoints;
