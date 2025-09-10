import api from "../apiSlice";
import { PaginatedResponse } from "@/types/paginatedResponse";
import qs from "query-string";
import { QueryParams } from "@/types/query_param";
import { Project, ProjectsStats, ProjectStatus } from "@/types/project";

export const clientsEndpoints = api.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query<
      PaginatedResponse<Project> | Project[],
      QueryParams | void
    >({
      query: (params) => ({
        url: `/projects/projects?${qs.stringify(params || {})}`,
        method: "GET",
      }),
      providesTags: (result) => {
        let array = Array.isArray(result) ? result : result?.data;
        return array
          ? [
              ...array.map((project) => ({
                type: "Project" as const,
                id: project.id,
              })),
              { type: "Project", id: "LIST" },
            ]
          : [{ type: "Project", id: "LIST" }];
      },
    }),
    getProject: builder.query<Project, { id: string }>({
      query: ({ id }) => ({
        url: `/projects/projects/${id}/`,
        method: "GET",
      }),
      providesTags: (res, error, arg) => [{ type: "Project", id: arg.id }],
    }),
    project: builder.mutation<
      Project,
      { data?: Partial<Project>; method?: string; url?: string }
    >({
      query: ({ data, method, url }) => ({
        url: url || `projects/projects/`,
        method: method || "POST",
        data,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const response = (await queryFulfilled).data;
          // Invalidate the Projects LIST tag on successful POST
          dispatch(
            api.util.invalidateTags([
              { type: "Project", id: "LIST" },
              { type: "Project", id: response.id },
            ])
          );
        } catch {
          // Do nothing if the request fails
        }
      },
    }),
    switchProjectStatus: builder.mutation<
      { status: ProjectStatus },
      { id: string; status: ProjectStatus }
    >({
      query: ({ id, status }) => ({
        url: `/projects/projects/${id}/switch_status/`,
        method: "POST",
        data: { status: status },
      }),
      invalidatesTags: [{ type: "Project", id: "LIST" }],
    }),
    getProjectsStats: builder.query<ProjectsStats, void>({
      query: () => ({ url: "/projects/get-projects-stats/", method: "GET" }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProjectsQuery,
  useGetProjectQuery,
  useProjectMutation,
  useSwitchProjectStatusMutation,
  useGetProjectsStatsQuery,
} = clientsEndpoints;
