import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logger } from '../utils/logger.js';
import { getS3Bucket, getS3Client, isS3Configured } from '../utils/s3.js';

export const COURSE_COVER_URL_TTL_SECONDS = 60 * 60;

/**
 * Our upload keys look like `courses/{id}/cover/...`.
 * External/seed URLs stay as absolute http(s) or app-relative paths.
 */
export const isManagedS3ObjectKey = (value: string): boolean =>
  value.startsWith('courses/') && !value.includes('://');

export const isBrowserReadyImageUrl = (value: string): boolean =>
  value.startsWith('http://') ||
  value.startsWith('https://') ||
  value.startsWith('/');

export const createSignedObjectGetUrl = async (
  objectKey: string,
  expiresInSeconds = COURSE_COVER_URL_TTL_SECONDS,
): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: getS3Bucket(),
    Key: objectKey,
  });

  return getSignedUrl(getS3Client(), command, {
    expiresIn: expiresInSeconds,
  });
};

/**
 * Turns a stored cover field into something an <img> can load.
 * - http(s) / relative → returned as-is
 * - S3 object key → short-lived signed GET URL
 * - missing / S3 unavailable → null (UI uses placeholder)
 */
export const resolveCourseCoverImageUrl = async (
  image: string | null | undefined,
): Promise<string | null> => {
  if (!image?.trim()) return null;

  const value = image.trim();

  if (isBrowserReadyImageUrl(value)) {
    return value;
  }

  if (!isManagedS3ObjectKey(value) || !isS3Configured()) {
    return null;
  }

  try {
    return await createSignedObjectGetUrl(value);
  } catch (error) {
    logger.warn(
      { err: error, objectKey: value },
      'Failed to sign course cover URL',
    );
    return null;
  }
};

export const attachCourseCoverImageUrl = async <
  T extends { image?: string | null },
>(
  course: T,
): Promise<T & { imageUrl: string | null }> => ({
  ...course,
  imageUrl: await resolveCourseCoverImageUrl(course.image),
});

export const attachCourseCoverImageUrls = async <
  T extends { image?: string | null },
>(
  courses: T[],
): Promise<Array<T & { imageUrl: string | null }>> =>
  Promise.all(courses.map((course) => attachCourseCoverImageUrl(course)));
