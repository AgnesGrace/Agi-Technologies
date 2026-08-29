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

export const lectureSelect = {
  id: true,
  slug: true,
  title: true,
  type: true,
  content: true,
  videoKey: true,
  pdfKey: true,
  order: true,
} as const;

export const sectionSelect = {
  id: true,
  title: true,
  description: true,
  order: true,
  lectures: {
    orderBy: {
      order: 'asc',
    },
    select: lectureSelect,
  },
} as const;

/** Full outline for the instructor course editor (drafts included). */
export const courseEditorSelect = {
  id: true,
  slug: true,
  title: true,
  description: true,
  category: true,
  image: true,
  price: true,
  level: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  instructorId: true,

  sections: {
    orderBy: {
      order: 'asc',
    },
    select: sectionSelect,
  },
} as const;
