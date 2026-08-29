import {
  BaseQueryApi,
  createApi,
  FetchArgs,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react"
import {
  Course,
  CourseEditor,
  Transaction,
  GetCoursesData,
  GetCoursesParams,
  GetTransactionsData,
  PaginationParams,
  Section,
  Lecture,
  UpdateCourseMetadataInput,
  UpdateLectureInput,
  UpdateSectionInput,
  LearningCoursePayload,
  CourseLearningProgress,
  SubmitQuizResult,
  MediaKind,
  PresignUploadResult,
  PresignDownloadResult,
} from "./api.types"
import { User } from "@clerk/nextjs/server"
import { toast } from "sonner"

declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken: () => Promise<string | null>
      }
    }
  }
}

const shouldSkipSuccessToast = (args: string | FetchArgs) => {
  if (typeof args === "string") return false
  const method = args.method?.toUpperCase() ?? "GET"
  const url = String(args.url)
  // Quiet PATCHes and media URL minting — UI owns those toasts.
  if (method === "PATCH" && url.includes("/instructor/")) return true
  if (method === "POST" && url.includes("/media/")) return true
  return false
}

const customBaseQuery = async (
  args: string | FetchArgs,
  api: BaseQueryApi,
  extraOptions: object
) => {
  const baseQuery = fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
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
      return result
    }

    const requestArgs = typeof args === "string" ? null : (args as FetchArgs)
    const isMutationRequest =
      Boolean(requestArgs?.method) && requestArgs?.method !== "GET"

    if (isMutationRequest && !shouldSkipSuccessToast(args)) {
      toast.success(result.data?.message || "Action completed Successfully")
    }
    if (result.data) {
      result.data = result.data.data
    }
    return result
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error"
    return { error: { status: "FETCH_ERROR", error: errorMessage } }
  }
}

export const api = createApi({
  baseQuery: customBaseQuery,
  reducerPath: "api",
  tagTypes: [
    "Courses",
    "CourseEditor",
    "Users",
    "Transactions",
    "Learning",
  ],
  keepUnusedDataFor: 60,
  endpoints: (build) => ({
    getCourses: build.query<GetCoursesData, GetCoursesParams>({
      query: ({ category, search, page = 1, limit = 12 }) => ({
        url: "courses",
        params: { category, search, page, limit },
      }),
      keepUnusedDataFor: 120,
      providesTags: ["Courses"],
    }),

    getCourse: build.query<Course, string>({
      query: (slug) => `/courses/${slug}`,
      transformResponse: (response: { course: Course }) => response.course,
      keepUnusedDataFor: 120,
      providesTags: (_result, _error, slug) => [{ type: "Courses", id: slug }],
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

    getLearningCourse: build.query<
      LearningCoursePayload,
      { courseId: number; lectureId?: number }
    >({
      query: ({ courseId, lectureId }) => ({
        url: `/courses/me/learn/${courseId}`,
        params: lectureId ? { lectureId } : undefined,
      }),
      serializeQueryArgs: ({ queryArgs }) => queryArgs.courseId,
      merge: (_currentCache, incoming) => incoming,
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.lectureId !== previousArg?.lectureId
      },
      providesTags: (_result, _error, { courseId }) => [
        { type: "Learning", id: courseId },
      ],
    }),

    markLectureComplete: build.mutation<
      { progress: CourseLearningProgress },
      { courseId: number; lectureId: number }
    >({
      query: ({ courseId, lectureId }) => ({
        url: `/courses/me/learn/${courseId}/lectures/${lectureId}/complete`,
        method: "POST",
      }),
      async onQueryStarted({ courseId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(
            api.util.updateQueryData(
              "getLearningCourse",
              { courseId },
              (draft) => {
                draft.progress = data.progress
              }
            )
          )
        } catch {
          /* handled */
        }
      },
    }),

    markLectureIncomplete: build.mutation<
      { progress: CourseLearningProgress },
      { courseId: number; lectureId: number }
    >({
      query: ({ courseId, lectureId }) => ({
        url: `/courses/me/learn/${courseId}/lectures/${lectureId}/complete`,
        method: "DELETE",
      }),
      async onQueryStarted({ courseId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(
            api.util.updateQueryData(
              "getLearningCourse",
              { courseId },
              (draft) => {
                draft.progress = data.progress
              }
            )
          )
        } catch {
          /* handled */
        }
      },
    }),

    submitLectureQuiz: build.mutation<
      SubmitQuizResult,
      {
        courseId: number
        lectureId: number
        answers: Record<string, string>
      }
    >({
      query: ({ courseId, lectureId, answers }) => ({
        url: `/courses/me/learn/${courseId}/lectures/${lectureId}/quiz/submit`,
        method: "POST",
        body: { answers },
      }),
      async onQueryStarted({ courseId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          if (!data.progress) return
          dispatch(
            api.util.updateQueryData(
              "getLearningCourse",
              { courseId },
              (draft) => {
                draft.progress = data.progress!
              }
            )
          )
        } catch {
          /* handled */
        }
      },
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

    createCourse: build.mutation<{ course: Course }, void>({
      query: () => ({
        url: "/courses/instructor/courses",
        method: "POST",
      }),
      invalidatesTags: ["Courses"],
    }),

    getInstructorCourse: build.query<CourseEditor, number>({
      query: (courseId) => `/courses/instructor/courses/${courseId}`,
      transformResponse: (response: { course: CourseEditor }) => response.course,
      providesTags: (_result, _error, courseId) => [
        { type: "CourseEditor", id: courseId },
      ],
    }),

    updateCourseMetadata: build.mutation<
      { course: CourseEditor },
      { courseId: number; data: UpdateCourseMetadataInput }
    >({
      query: ({ courseId, data }) => ({
        url: `/courses/instructor/courses/${courseId}`,
        method: "PATCH",
        body: data,
      }),
      async onQueryStarted({ courseId, data }, { dispatch, queryFulfilled }) {
        try {
          const { data: result } = await queryFulfilled
          dispatch(
            api.util.updateQueryData(
              "getInstructorCourse",
              courseId,
              () => result.course
            )
          )
          if (data.status) {
            dispatch(api.util.invalidateTags(["Courses"]))
          }
        } catch {
          /* toast already handled */
        }
      },
    }),

    deleteCourse: build.mutation<void, number>({
      query: (courseId) => ({
        url: `/courses/instructor/courses/${courseId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Courses", "CourseEditor"],
    }),

    createSection: build.mutation<
      { section: Section },
      { courseId: number; title?: string; description?: string | null }
    >({
      query: ({ courseId, ...body }) => ({
        url: `/courses/instructor/courses/${courseId}/sections`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { courseId }) => [
        { type: "CourseEditor", id: courseId },
      ],
    }),

    updateSection: build.mutation<
      { section: Section },
      { sectionId: number; courseId: number; data: UpdateSectionInput }
    >({
      query: ({ sectionId, data }) => ({
        url: `/courses/instructor/sections/${sectionId}`,
        method: "PATCH",
        body: data,
      }),
      async onQueryStarted(
        { sectionId, courseId },
        { dispatch, queryFulfilled }
      ) {
        try {
          const { data: result } = await queryFulfilled
          dispatch(
            api.util.updateQueryData(
              "getInstructorCourse",
              courseId,
              (draft) => {
                const section = draft.sections.find((s) => s.id === sectionId)
                if (section) {
                  Object.assign(section, result.section, {
                    lectures: section.lectures,
                  })
                }
              }
            )
          )
        } catch {
          /* handled */
        }
      },
    }),

    deleteSection: build.mutation<
      void,
      { sectionId: number; courseId: number }
    >({
      query: ({ sectionId }) => ({
        url: `/courses/instructor/sections/${sectionId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { courseId }) => [
        { type: "CourseEditor", id: courseId },
      ],
    }),

    reorderSections: build.mutation<
      { sections: Section[] },
      { courseId: number; orderedIds: number[] }
    >({
      query: ({ courseId, orderedIds }) => ({
        url: `/courses/instructor/courses/${courseId}/sections/reorder`,
        method: "PUT",
        body: { orderedIds },
      }),
      invalidatesTags: (_result, _error, { courseId }) => [
        { type: "CourseEditor", id: courseId },
      ],
    }),

    createLecture: build.mutation<
      { lecture: Lecture },
      { sectionId: number; courseId: number; title?: string; type?: string }
    >({
      query: ({ sectionId, title, type }) => ({
        url: `/courses/instructor/sections/${sectionId}/lectures`,
        method: "POST",
        body: { title, type },
      }),
      invalidatesTags: (_result, _error, { courseId }) => [
        { type: "CourseEditor", id: courseId },
      ],
    }),

    updateLecture: build.mutation<
      { lecture: Lecture },
      { lectureId: number; courseId: number; data: UpdateLectureInput }
    >({
      query: ({ lectureId, data }) => ({
        url: `/courses/instructor/lectures/${lectureId}`,
        method: "PATCH",
        body: data,
      }),
      async onQueryStarted(
        { lectureId, courseId },
        { dispatch, queryFulfilled }
      ) {
        try {
          const { data: result } = await queryFulfilled
          dispatch(
            api.util.updateQueryData(
              "getInstructorCourse",
              courseId,
              (draft) => {
                for (const section of draft.sections) {
                  const lectures = section.lectures ?? []
                  const index = lectures.findIndex((l) => l.id === lectureId)
                  if (index >= 0) {
                    lectures[index] = result.lecture
                  }
                }
              }
            )
          )
        } catch {
          /* handled */
        }
      },
    }),

    deleteLecture: build.mutation<
      void,
      { lectureId: number; courseId: number }
    >({
      query: ({ lectureId }) => ({
        url: `/courses/instructor/lectures/${lectureId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { courseId }) => [
        { type: "CourseEditor", id: courseId },
      ],
    }),

    reorderLectures: build.mutation<
      { lectures: Lecture[] },
      { sectionId: number; courseId: number; orderedIds: number[] }
    >({
      query: ({ sectionId, orderedIds }) => ({
        url: `/courses/instructor/sections/${sectionId}/lectures/reorder`,
        method: "PUT",
        body: { orderedIds },
      }),
      invalidatesTags: (_result, _error, { courseId }) => [
        { type: "CourseEditor", id: courseId },
      ],
    }),

    moveLecture: build.mutation<
      { course: CourseEditor },
      {
        lectureId: number
        courseId: number
        targetSectionId: number
        targetIndex: number
      }
    >({
      query: ({ lectureId, targetSectionId, targetIndex }) => ({
        url: `/courses/instructor/lectures/${lectureId}/move`,
        method: "PUT",
        body: { targetSectionId, targetIndex },
      }),
      async onQueryStarted({ courseId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          if (data.course) {
            dispatch(
              api.util.updateQueryData(
                "getInstructorCourse",
                courseId,
                () => data.course
              )
            )
          }
        } catch {
          /* handled */
        }
      },
    }),

    createUploadPresign: build.mutation<
      PresignUploadResult,
      {
        courseId: number
        kind: MediaKind
        contentType: string
        fileSize: number
        lectureId?: number
        fileName?: string
      }
    >({
      query: (body) => ({
        url: "/media/uploads/presign",
        method: "POST",
        body,
      }),
    }),

    createDownloadPresign: build.mutation<
      PresignDownloadResult,
      { courseId: number; kind: MediaKind; lectureId?: number; key?: string }
    >({
      query: (body) => ({
        url: "/media/downloads/presign",
        method: "POST",
        body,
      }),
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
  useGetLearningCourseQuery,
  useMarkLectureCompleteMutation,
  useMarkLectureIncompleteMutation,
  useSubmitLectureQuizMutation,
  useGetInstructorCoursesQuery,
  useGetMyTransactionsQuery,
  useCreateCourseMutation,
  useGetInstructorCourseQuery,
  useUpdateCourseMetadataMutation,
  useDeleteCourseMutation,
  useCreateSectionMutation,
  useUpdateSectionMutation,
  useDeleteSectionMutation,
  useReorderSectionsMutation,
  useCreateLectureMutation,
  useUpdateLectureMutation,
  useDeleteLectureMutation,
  useReorderLecturesMutation,
  useMoveLectureMutation,
  useCreateUploadPresignMutation,
  useCreateDownloadPresignMutation,
} = api
