import { Request, Response } from 'express';
import db from '../db/db.js';

interface GetCoursesQuery {
  category?: string;
  page?: string;
  limit?: string;
}
export const getCourses = async (
  req: Request<{}, {}, {}, GetCoursesQuery>,
  res: Response,
): Promise<void> => {
  try {
    const { category, page = '1', limit = '12' } = req.query;
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 12));
    const skip = (parsedPage - 1) * parsedLimit;

    const filterCondition = category
      ? { category: String(category).trim() }
      : {};

    const [courses, totalCouses] = await db.$transaction([
      db.course.findMany({
        where: filterCondition,
        skip: skip,
        take: parsedLimit,
        orderBy: { createdAt: 'desc' },
        include: {
          sections: {
            orderBy: { order: 'asc' },
            select: {
              description: true,
              title: true,
              lectures: {
                orderBy: { order: 'asc' },
                select: {
                  id: true,
                  slug: true,
                  title: true,
                  type: true,
                  videoUrl: true,
                  order: true,
                },
              },
            },
          },
          instructor: {
            select: {
              name: true,
              imageUrl: true,
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
          enrollments: {
            select: {
              userId: true,
            },
          },
        },
      }),
      db.course.count({ where: filterCondition }),
    ]);
    res.status(200).json({
      status: 'success',
      results: courses.length,
      pagination: {
        totalItems: totalCouses,
        totalPage: Math.ceil(totalCouses / parsedLimit),
        currentPage: parsedPage,
        pageSize: parsedLimit,
      },
      data: courses,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 'error',
      message:
        'An error occured while retrieveing this data, please try again later',
    });
  }
};

export const getCourseBySlug = async (
  req: Request<{ slug: string }>,
  res: Response,
): Promise<void> => {
  try {
    console.log(req.params);
    const { slug } = req.params;
    console.log(slug);

    const course = await db.course.findUnique({
      where: { slug: String(slug) },
      include: {
        instructor: {
          select: {
            name: true,
            imageUrl: true,
            role: true,
          },
        },
        sections: {
          orderBy: { order: 'asc' },
          include: {
            lectures: {
              orderBy: { order: 'asc' },
              select: {
                id: true,
                slug: true,
                title: true,
                type: true,
                videoUrl: true,
                order: true,
              },
            },
          },
        },
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { name: true, imageUrl: true },
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
    console.error('Enterprise Query Pipeline Error [getCourseBySlug]:', error);

    res.status(500).json({
      status: 'error',
      message:
        'An internal server error occurred while retrieving the course details.',
    });
  }
};
