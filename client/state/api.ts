import {
  BaseQueryApi,
  createApi,
  FetchArgs,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react"
import { Course } from "./api.types"

const customBaseQuery = async (
  args: string | FetchArgs,
  api: BaseQueryApi,
  extraOptions: any
) => {
  const baseQuery = fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  })
  try {
    const result: any = await baseQuery(args, api, extraOptions)
    return result
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error"
    return { error: { error: { status: "FETCH_ERROR", error: errorMessage } } }
  }
}

export const api = createApi({
  baseQuery: customBaseQuery,
  reducerPath: "api",
  tagTypes: ["Courses"],
  endpoints: (build) => ({
    getCourses: build.query<Course[], { category?: string }>({
      query: ({ category }) => ({
        url: "courses",
        params: { category },
      }),
      providesTags: ["Courses"],
    }),
  }),
})

export const { useGetCoursesQuery } = api
