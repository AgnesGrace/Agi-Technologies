export type CourseLevel = "Beginner" | "Intermediate" | "Advanced"
export type CourseStatus = "Draft" | "Published"
export type LectureType = "Video" | "Text" | "Quiz"

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
    userRole: "teacher" | "learner"
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
  id?: number
  slug: string
  title: string
  type: LectureType
  content?: string | null
  videoUrl?: string | null
  order: number
}

export interface Section {
  id?: number
  title: string
  description?: string | null
  order: number
  courseId: number
  lectures: Lecture[]
}

export interface Course {
  id: number
  slug: string
  title: string
  description?: string | null
  category: string
  image?: string | null
  price: number
  level: CourseLevel
  status: CourseStatus
  instructorId: string
  instructor: Instructor
  sections?: Section[]
  enrollments: Enrollment[]
}

export interface Transaction {
  id: number
  transactionId: string
  amount: number
  paymentProvider: string
  userId: string
  courseId: number
  createdAt: string
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
  role: "teacher" | "learner" | "admin"
}
export interface LectureProgress {
  id: number
  lectureId: number
  isCompleted: boolean
  updatedAt: string
}

export interface Enrollment {
  id: string
  userId: string
  courseId: string
  course: Course
}
