import { Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import db from '../../db/db.js';
import {
  buildPagination,
  PaginationQuery,
  parsePagination,
} from '../../utils/helper.js';
import { courseCardSelect } from './courseSelect.js';

interface GetCoursesQuery extends PaginationQuery {
  category?: string;
  search?: string;
}

const getEnrolledCourseIdSet = async (
  userId: string,
  courseIds: number[],
): Promise<Set<number>> => {
  if (courseIds.length === 0) return new Set();

  const enrollments = await db.enrollment.findMany({
    where: {
      userId,
      courseId: { in: courseIds },
    },
    select: { courseId: true },
  });

  return new Set(enrollments.map((enrollment) => enrollment.courseId));
};

export const getCourses = async (
  req: Request<{}, {}, {}, GetCoursesQuery>,
  res: Response,
): Promise<void> => {
  try {
    const { category, search, page, limit } = req.query;

    const { currentPage, pageSize, skip } = parsePagination(page, limit);

    const searchTerm = search?.trim();

    const where = {
      status: 'Published' as const,
      ...(category?.trim() ? { category: category.trim() } : {}),
      ...(searchTerm
        ? {
            OR: [
              { title: { contains: searchTerm, mode: 'insensitive' as const } },
              {
                description: {
                  contains: searchTerm,
                  mode: 'insensitive' as const,
                },
              },
              {
                category: {
                  contains: searchTerm,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    };

    const [courses, totalCourses] = await Promise.all([
      db.course.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: {
          createdAt: 'desc',
        },
        select: courseCardSelect,
      }),

      db.course.count({
        where,
      }),
    ]);

    const { userId } = getAuth(req);
    const enrolledCourseIds = userId
      ? await getEnrolledCourseIdSet(
          userId,
          courses.map((course) => course.id),
        )
      : new Set<number>();

    res.status(200).json({
      status: 'success',
      data: {
        courses: courses.map((course) => ({
          ...course,
          isEnrolled: enrolledCourseIds.has(course.id),
        })),
        pagination: buildPagination(totalCourses, currentPage, pageSize),
      },
    });
  } catch (error) {
    console.error('Error retrieving courses:', error);

    res.status(500).json({
      status: 'error',
      message: 'Unable to retrieve courses. Please try again later.',
    });
  }
};

export const getCourseBySlug = async (
  req: Request<{ slug: string }>,
  res: Response,
): Promise<void> => {
  try {
    const { slug } = req.params;

    const course = await db.course.findFirst({
      where: {
        slug,
        status: 'Published',
      },

      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            role: true,
          },
        },

        sections: {
          orderBy: {
            order: 'asc',
          },

          include: {
            lectures: {
              orderBy: {
                order: 'asc',
              },

              select: {
                id: true,
                slug: true,
                title: true,
                type: true,
                order: true,
              },
            },
          },
        },

        reviews: {
          take: 5,
          orderBy: {
            createdAt: 'desc',
          },

          include: {
            user: {
              select: {
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      res.status(404).json({
        status: 'fail',
        message: 'The requested course listing could not be found.',
      });
      return;
    }

    const { userId } = getAuth(req);
    let isEnrolled = false;

    if (userId) {
      const enrollment = await db.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId: course.id,
          },
        },
        select: { id: true },
      });
      isEnrolled = Boolean(enrollment);
    }

    res.status(200).json({
      status: 'success',
      data: {
        course: {
          ...course,
          isEnrolled,
        },
      },
    });
  } catch (error) {
    console.error('Error retrieving course by slug:', error);

    res.status(500).json({
      status: 'error',
      message: 'Unable to retrieve course details. Please try again later.',
    });
  }
};

export const getEnrolledCoursesByUser = async (
  req: Request<{}, {}, {}, PaginationQuery>,
  res: Response,
): Promise<void> => {
  try {
    const { userId } = getAuth(req);
    const { page, limit } = req.query;

    if (!userId) {
      res.status(401).json({
        status: 'fail',
        message: 'Unauthorized',
      });
      return;
    }

    const { currentPage, pageSize, skip } = parsePagination(page, limit);

    const where = {
      userId,
    };

    const [enrollments, totalEnrollments] = await Promise.all([
      db.enrollment.findMany({
        where,
        skip,
        take: pageSize,

        orderBy: {
          enrolledAt: 'desc',
        },

        select: {
          id: true,
          enrolledAt: true,

          course: {
            select: courseCardSelect,
          },
        },
      }),

      db.enrollment.count({
        where,
      }),
    ]);

    const courses = enrollments.map(({ course, id, enrolledAt }) => ({
      ...course,
      isEnrolled: true,
      enrollment: {
        id,
        enrolledAt,
      },
    }));

    res.status(200).json({
      status: 'success',

      data: {
        courses,

        pagination: buildPagination(totalEnrollments, currentPage, pageSize),
      },
    });
  } catch (error) {
    console.error('Error retrieving enrolled courses:', error);

    res.status(500).json({
      status: 'error',
      message: 'Unable to retrieve enrolled courses. Please try again later.',
    });
  }
};

export const getCoursesByInstructor = async (
  req: Request<{}, {}, {}, PaginationQuery>,
  res: Response,
): Promise<void> => {
  try {
    const { userId } = getAuth(req);
    const { page, limit } = req.query;

    if (!userId) {
      res.status(401).json({
        status: 'fail',
        message: 'Unauthorized',
      });
      return;
    }

    const { currentPage, pageSize, skip } = parsePagination(page, limit);

    const where = {
      instructorId: userId,
    };

    const [courses, totalCourses] = await Promise.all([
      db.course.findMany({
        where,
        skip,
        take: pageSize,

        orderBy: {
          createdAt: 'desc',
        },

        select: courseCardSelect,
      }),

      db.course.count({
        where,
      }),
    ]);

    res.status(200).json({
      status: 'success',

      data: {
        courses,

        pagination: buildPagination(totalCourses, currentPage, pageSize),
      },
    });
  } catch (error) {
    console.error('Error retrieving instructor courses:', error);

    res.status(500).json({
      status: 'error',
      message: 'Unable to retrieve instructor courses. Please try again later.',
    });
  }
};
