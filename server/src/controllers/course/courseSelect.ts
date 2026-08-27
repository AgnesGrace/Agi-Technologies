export const courseCardSelect = {
  id: true,
  slug: true,
  title: true,
  description: true,
  image: true,
  category: true,
  level: true,
  price: true,
  status: true,
  createdAt: true,

  instructor: {
    select: {
      id: true,
      name: true,
      imageUrl: true,
    },
  },

  _count: {
    select: {
      sections: true,
      enrollments: true,
      reviews: true,
    },
  },
  sections: {
    select: {
      _count: {
        select: {
          lectures: true,
        },
      },
    },
  },
} as const;
