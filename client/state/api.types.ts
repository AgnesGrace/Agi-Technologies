export type CourseLevel = "Beginner" | "Intermediate" | "Advanced"
export type CourseStatus = "Draft" | "Published"
export type LectureType = "Video" | "Text" | "Quiz" | "Pdf"

export interface LoggedInUserSettings {
  emailAlerts?: boolean
  smsAlerts?: boolean
  phoneCalls?: boolean
  courseNotifications?: boolean
  notificationFrequency?: "immediate" | "daily" | "weekly" | "monthly"
}

export interface User {
  userId: string
  firstName?: string
  lastName?: string
  username?: string
  email: string
  publicMetadata: {
    userRole: "instructor" | "learner" | "admin"
  }
  privateMetadata: {
    settings?: LoggedInUserSettings
    paymentMethods?: Array<PaymentMethod>
    defaultPaymentMethodId?: string
    stripeCustomerId?: string
  }
  unsafeMetadata: {
    bio?: string
    urls?: string[]
  }
}

export interface Lecture {
  id: number
  slug: string
  title: string
  type: LectureType
  content?: string | null
  videoKey?: string | null
  pdfKey?: string | null
  order: number
}

export interface Section {
  id: number
  title: string
  description?: string | null
  order: number
  courseId?: number
  lectures?: Lecture[]
  _count?: {
    lectures: number
  }
}

export interface Course {
  id: number
  slug: string
  title: string
  description?: string | null
  category: string
  /**
   * Stored cover: S3 object key (`courses/...`) or legacy absolute URL.
   * Prefer `imageUrl` for rendering in the UI.
   */
  image?: string | null
  /** Browser-ready cover URL (signed S3 GET or public/legacy URL). */
  imageUrl?: string | null
  /** Integer cents (e.g. 4999 = $49.99). */
  price: number
  level: CourseLevel
  status: CourseStatus
  instructorId: string
  instructor: Instructor
  sections?: Section[]
  enrollments?: Enrollment[]
  isEnrolled?: boolean
  updatedAt?: string
  createdAt?: string
  _count?: {
    sections: number
    enrollments: number
    reviews: number
  }
}

/** Full outline returned by the instructor editor API. */
export interface CourseEditor
  extends Omit<Course, "instructor" | "enrollments" | "isEnrolled"> {
  sections: Section[]
}

export interface UpdateCourseMetadataInput {
  title?: string
  description?: string | null
  category?: string
  image?: string | null
  price?: number
  level?: CourseLevel
  status?: CourseStatus
}

export interface UpdateSectionInput {
  title?: string
  description?: string | null
}

export interface UpdateLectureInput {
  title?: string
  type?: LectureType
  content?: string | null
  videoKey?: string | null
  pdfKey?: string | null
}

export interface PaginationMeta {
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface GetCoursesParams {
  category?: string
  search?: string
  page?: number
  limit?: number
}

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface GetCoursesData {
  courses: Course[]
  pagination: PaginationMeta
}
export interface Transaction {
  id: number
  transactionId: string
  amount: number
  paymentProvider: string
  userId: string
  courseId: number
  createdAt: string
  courseSlug?: string
  course?: {
    id: number
    slug: string
    title: string
    image?: string | null
  }
}

interface PaymentMethod {
  methodId: string
  type: string
  lastFour: string
  expiry: string
}

interface Instructor {
  imageUrl: string
  name: string
  role: "instructor" | "learner" | "admin"
}
export interface LectureProgress {
  id: number
  lectureId: number
  isCompleted: boolean
  updatedAt: string
}

export interface CourseLearningProgress {
  overallProgress: number
  isCompleted: boolean
  lastLectureId: number | null
  completedLectureIds: number[]
}

export interface QuizGradeResult {
  total: number
  correct: number
  percent: number
  passed: boolean
  results: Array<{
    questionId: string
    selectedOptionId: string | null
    correctOptionId: string
    isCorrect: boolean
    explanation: string | null
  }>
}

export interface SubmitQuizResult {
  grade: QuizGradeResult
  progress: CourseLearningProgress | null
}

/** Course outline + progress for the learner player. */
export interface LearningCoursePayload {
  course: Course & { sections: Section[] }
  progress: CourseLearningProgress
  isInstructorPreview: boolean
}

export type MediaKind = "video" | "pdf" | "cover" | "image"

export interface PresignUploadResult {
  uploadUrl: string
  key: string
  headers: { "Content-Type": string }
  expiresIn: number
}

export interface PresignDownloadResult {
  downloadUrl: string
  key: string
  expiresIn: number
}

export interface Enrollment {
  id: string
  userId: string
  courseId: string
  course: Course
}

export interface GetTransactionsData {
  transactions: Transaction[]
  pagination: PaginationMeta
}
