import { describe, expect, it } from 'vitest';
import {
  evaluateCoursePublishReadiness,
  formatPublishBlockedMessage,
  PLACEHOLDER_COURSE_CATEGORY,
  PLACEHOLDER_COURSE_TITLE,
  PublishRequirementId,
} from './course-publish-readiness.js';

const readySnapshot = {
  title: 'Intro to TypeScript',
  description: 'Build confidence with TypeScript fundamentals.',
  category: 'Programming',
  priceCents: 0,
  coverImageKey: 'courses/1/cover/abc.jpg',
  sectionCount: 1,
  lectureCount: 2,
};

describe('evaluateCoursePublishReadiness', () => {
  it('allows publish when every requirement is met', () => {
    const readiness = evaluateCoursePublishReadiness(readySnapshot);
    expect(readiness.canPublish).toBe(true);
    expect(readiness.unmetLabels).toEqual([]);
    expect(
      readiness.requirements.every((requirement) => requirement.isMet),
    ).toBe(true);
  });

  it('blocks placeholder title and category', () => {
    const readiness = evaluateCoursePublishReadiness({
      ...readySnapshot,
      title: PLACEHOLDER_COURSE_TITLE,
      category: PLACEHOLDER_COURSE_CATEGORY,
    });

    expect(readiness.canPublish).toBe(false);
    expect(readiness.unmetLabels).toContain('Course title');
    expect(readiness.unmetLabels).toContain('Category');
  });

  it('blocks missing description, cover, and curriculum', () => {
    const readiness = evaluateCoursePublishReadiness({
      ...readySnapshot,
      description: '   ',
      coverImageKey: null,
      sectionCount: 0,
      lectureCount: 0,
    });

    const unmetIds = readiness.requirements
      .filter((requirement) => !requirement.isMet)
      .map((requirement) => requirement.id);

    expect(unmetIds).toEqual(
      expect.arrayContaining([
        PublishRequirementId.Description,
        PublishRequirementId.CoverImage,
        PublishRequirementId.AtLeastOneSection,
        PublishRequirementId.AtLeastOneLecture,
      ]),
    );
  });

  it('blocks paid prices below Stripe minimum', () => {
    const readiness = evaluateCoursePublishReadiness({
      ...readySnapshot,
      priceCents: 49,
    });

    expect(readiness.canPublish).toBe(false);
    expect(readiness.unmetLabels).toContain('Price');
  });

  it('formats a clear blocked message', () => {
    const readiness = evaluateCoursePublishReadiness({
      ...readySnapshot,
      description: null,
    });

    expect(formatPublishBlockedMessage(readiness)).toContain(
      'Cannot publish yet',
    );
    expect(formatPublishBlockedMessage(readiness)).toContain('Description');
  });
});
