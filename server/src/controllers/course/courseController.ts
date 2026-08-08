import { Request, Response } from 'express';
import db from '../../db/db.js';
import {
  buildPagination,
  PaginationQuery,
  parsePagination,
} from '../../utils/helper.js';
import { courseCardSelect } from './courseSelect.js';

interface GetCoursesQuery extends PaginationQuery {
  category?: string;
}

export const getCourses = async (
  req: Request<{}, {}, {}, GetCoursesQuery>,
  res: Response,
): Promise<void> => {
  try {
    const { category, page, limit } = req.query;

    const { currentPage, pageSize, skip } = parsePagination(page, limit);

    const where = category
      ? {
          category: category.trim(),
        }
      : {};

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

    const course = await db.course.findUnique({
      where: {
        slug,
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

    res.status(200).json({
      status: 'success',
      data: {
        course,
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
  req: Request<{ userId: string }, {}, {}, PaginationQuery>,
  res: Response,
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { page, limit } = req.query;

    if (!userId?.trim()) {
      res.status(400).json({
        status: 'fail',
        message: 'User ID is required.',
      });
      return;
    }

    const { currentPage, pageSize, skip } = parsePagination(page, limit);

    const where = {
      userId: userId.trim(),
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
  req: Request<{ instructorId: string }, {}, {}, PaginationQuery>,
  res: Response,
): Promise<void> => {
  try {
    const { instructorId } = req.params;
    const { page, limit } = req.query;

    if (!instructorId?.trim()) {
      res.status(400).json({
        status: 'fail',
        message: 'Instructor ID is required.',
      });
      return;
    }

    const { currentPage, pageSize, skip } = parsePagination(page, limit);

    const where = {
      instructorId: instructorId.trim(),
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
