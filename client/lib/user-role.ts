export type UserRole = "learner" | "instructor" | "admin"

export const normalizeUserRole = (
  role?: string | null
): UserRole | undefined => {
  if (!role) return undefined

  const normalized = role.toLowerCase()

  if (normalized === "learner" || normalized === "student") {
    return "learner"
  }

  if (normalized === "instructor" || normalized === "teacher") {
    return "instructor"
  }

  if (normalized === "admin") {
    return "admin"
  }

  return undefined
}

export const dashboardCoursesPath = (role?: string | null) => {
  const normalized = normalizeUserRole(role)
  return normalized === "instructor" || normalized === "admin"
    ? "/instructor/courses"
    : "/user/courses"
}

export const dashboardProfilePath = (role?: string | null) => {
  const normalized = normalizeUserRole(role)
  return normalized === "instructor" || normalized === "admin"
    ? "/instructor/profile"
    : "/user/profile"
}
