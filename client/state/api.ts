import {
  BaseQueryApi,
  createApi,
  FetchArgs,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react"
import {
  Course,
  Transaction,
  GetCoursesData,
  GetCoursesParams,
  GetTransactionsData,
  PaginationParams,
} from "./api.types"
import { User } from "@clerk/nextjs/server"
import { Clerk } from "@clerk/clerk-js"
import { toast } from "sonner"

const customBaseQuery = async (
  args: string | FetchArgs,
  api: BaseQueryApi,
  extraOptions: any
) => {
  const baseQuery = fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,

    // It is a must to add the token to the headers here, this enable us to
    //authorize users since we are using the clerk auth middleware from
    // the backend.
    prepareHeaders: async (headers) => {
      const token = await window.Clerk?.session?.getToken()
      if (token) {
        headers.set("Authorization", `Bearer ${token}`)
      }
      return headers
    },
  })

  try {
    const result: any = await baseQuery(args, api, extraOptions)
    if (result.error) {
      const errorMsg =
        result.error.data?.message ||
        result.error.status.toString() ||
        "Ooops! Something went wrong"

      toast.error(errorMsg)
    }
    const requestArgs = args as FetchArgs
    const isMutationRequest = requestArgs.method && requestArgs.method !== "GET"

    if (isMutationRequest) {
      toast.success(result.data?.message || "Action completed Successfully")
    }
    if (result.data) {
      result.data = result.data.data
    }
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
  tagTypes: ["Courses", "Users", "Transactions"],
  endpoints: (build) => ({
    getCourses: build.query<GetCoursesData, GetCoursesParams>({
      query: ({ category, search, page = 1, limit = 12 }) => ({
        url: "courses",
        params: { category, search, page, limit },
      }),
      providesTags: ["Courses"],
    }),

    getCourse: build.query<Course, string>({
      query: (slug) => `/courses/${slug}`,
      transformResponse: (response: { course: Course }) => response.course,
      providesTags: (result, error, slug) => [{ type: "Courses", slug }],
    }),

    updateUserInfo: build.mutation<User, Partial<User> & { userId: string }>({
      query: ({ userId, ...updatedUserInfo }) => ({
        url: `users/${userId}`,
        method: "PUT",
        body: updatedUserInfo,
      }),
      invalidatesTags: ["Users"],
    }),

    createStripeTransactionIntent: build.mutation<
      { clientSecret: string },
      { courseSlug: string }
    >({
      query: ({ courseSlug }) => ({
        url: "/payments/stripe/transaction-intent",
        method: "POST",
        body: { courseSlug },
      }),
    }),

    createStripePayment: build.mutation<Transaction, Partial<Transaction>>({
      query: (transaction) => ({
        url: "/payments/stripe",
        method: "POST",
        body: { transaction },
      }),
      invalidatesTags: ["Courses", "Transactions"],
    }),
    syncClerkUser: build.mutation<User, void>({
      query: () => ({
        url: "/users/me/sync-user",
        method: "POST",
      }),
      invalidatesTags: ["Users"],
    }),

    getEnrolledCourses: build.query<GetCoursesData, PaginationParams | void>({
      query: (params) => ({
        url: "/courses/me/enrolled",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 12,
        },
      }),
      providesTags: ["Courses"],
    }),

    getInstructorCourses: build.query<GetCoursesData, PaginationParams | void>({
      query: (params) => ({
        url: "/courses/instructor/me",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 12,
        },
      }),
      providesTags: ["Courses"],
    }),

    getMyTransactions: build.query<
      GetTransactionsData,
      PaginationParams | void
    >({
      query: (params) => ({
        url: "/payments/transactions",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 12,
        },
      }),
      providesTags: ["Transactions"],
    }),
  }),
})

export const {
  useGetCoursesQuery,
  useGetCourseQuery,
  useUpdateUserInfoMutation,
  useCreateStripeTransactionIntentMutation,
  useCreateStripePaymentMutation,
  useSyncClerkUserMutation,
  useGetEnrolledCoursesQuery,
  useGetInstructorCoursesQuery,
  useGetMyTransactionsQuery,
} = api
