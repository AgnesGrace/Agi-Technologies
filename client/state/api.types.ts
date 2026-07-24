export type CourseLevel = "Beginner" | "Intermediate" | "Advanced"
export type CourseStatus = "Draft" | "Published"
export type LectureType = "Video" | "Text" | "Quiz"

export interface User {
  id: string
  email: string
  name: string
  imageUrl?: string | null
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN"
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
  sections?: Section[]
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

export interface LectureProgress {
  id: number
  lectureId: number
  isCompleted: boolean
  updatedAt: string
}
