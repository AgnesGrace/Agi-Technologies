import {
  isPurchasableAmount,
  STRIPE_MIN_AMOUNT_CENTS,
} from '../utils/money.js';

export const PLACEHOLDER_COURSE_TITLE = 'Untitled Course';
export const PLACEHOLDER_COURSE_CATEGORY = 'Uncategorized';

/**
 * Stable IDs for each publish gate. Keep in sync with
 * `client/lib/course-publish-readiness.ts`.
 */
export const PublishRequirementId = {
  MeaningfulTitle: 'meaningful_title',
  Description: 'description',
  Category: 'category',
  ValidPrice: 'valid_price',
  CoverImage: 'cover_image',
  AtLeastOneSection: 'at_least_one_section',
  AtLeastOneLecture: 'at_least_one_lecture',
} as const;

export type PublishRequirementId =
  (typeof PublishRequirementId)[keyof typeof PublishRequirementId];

export type CoursePublishSnapshot = {
  title: string;
  description: string | null | undefined;
  category: string;
  priceCents: number;
  coverImageKey: string | null | undefined;
  sectionCount: number;
  lectureCount: number;
};

export type PublishRequirement = {
  id: PublishRequirementId;
  label: string;
  helpText: string;
  isMet: boolean;
};

export type CoursePublishReadiness = {
  canPublish: boolean;
  requirements: PublishRequirement[];
  unmetLabels: string[];
};

type RequirementRule = {
  id: PublishRequirementId;
  label: string;
  helpText: string;
  isMet: (snapshot: CoursePublishSnapshot) => boolean;
};

const PUBLISH_REQUIREMENT_RULES: readonly RequirementRule[] = [
  {
    id: PublishRequirementId.MeaningfulTitle,
    label: 'Course title',
    helpText: 'Replace the placeholder with a clear, student-facing title.',
    isMet: (snapshot) => {
      const title = snapshot.title.trim();
      return title.length > 0 && title !== PLACEHOLDER_COURSE_TITLE;
    },
  },
  {
    id: PublishRequirementId.Description,
    label: 'Description',
    helpText: 'Explain what students will learn and why it matters.',
    isMet: (snapshot) => Boolean(snapshot.description?.trim()),
  },
  {
    id: PublishRequirementId.Category,
    label: 'Category',
    helpText: 'Pick a real category so the course can be discovered.',
    isMet: (snapshot) => {
      const category = snapshot.category.trim();
      return category.length > 0 && category !== PLACEHOLDER_COURSE_CATEGORY;
    },
  },
  {
    id: PublishRequirementId.ValidPrice,
    label: 'Price',
    helpText: `Use 0 for free, or at least ${STRIPE_MIN_AMOUNT_CENTS} cents for paid courses.`,
    isMet: (snapshot) =>
      snapshot.priceCents === 0 || isPurchasableAmount(snapshot.priceCents),
  },
  {
    id: PublishRequirementId.CoverImage,
    label: 'Cover image',
    helpText: 'Upload a cover so the course looks complete in the catalog.',
    isMet: (snapshot) => Boolean(snapshot.coverImageKey?.trim()),
  },
  {
    id: PublishRequirementId.AtLeastOneSection,
    label: 'At least one section',
    helpText: 'Organize lessons into a section before going live.',
    isMet: (snapshot) => snapshot.sectionCount >= 1,
  },
  {
    id: PublishRequirementId.AtLeastOneLecture,
    label: 'At least one lesson',
    helpText: 'Students need at least one lesson to start learning.',
    isMet: (snapshot) => snapshot.lectureCount >= 1,
  },
];

/**
 * Pure publish gate — no I/O. Controllers load a snapshot, then call this.
 */
export const evaluateCoursePublishReadiness = (
  snapshot: CoursePublishSnapshot,
): CoursePublishReadiness => {
  const requirements: PublishRequirement[] = PUBLISH_REQUIREMENT_RULES.map(
    (rule) => ({
      id: rule.id,
      label: rule.label,
      helpText: rule.helpText,
      isMet: rule.isMet(snapshot),
    }),
  );

  const unmet = requirements.filter((requirement) => !requirement.isMet);

  return {
    canPublish: unmet.length === 0,
    requirements,
    unmetLabels: unmet.map((requirement) => requirement.label),
  };
};

export const formatPublishBlockedMessage = (
  readiness: CoursePublishReadiness,
): string => {
  if (readiness.canPublish) {
    return 'Course is ready to publish.';
  }

  return `Cannot publish yet. Still needs: ${readiness.unmetLabels.join(', ')}.`;
};
