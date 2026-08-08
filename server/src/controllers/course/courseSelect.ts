export const courseCardSelect = {
  id: true,
  slug: true,
  title: true,
  description: true,
  image: true,
  category: true,
  level: true,
  price: true,
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
} as const;
