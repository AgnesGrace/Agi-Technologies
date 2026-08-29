import { S3Client } from '@aws-sdk/client-s3';

export type MediaKind = 'video' | 'pdf' | 'cover' | 'image';

const requiredS3Env = [
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION',
  'AWS_S3_BUCKET',
] as const;

export const isS3Configured = () =>
  requiredS3Env.every((key) => Boolean(process.env[key]));

export const getS3Bucket = () => {
  const bucket = process.env.AWS_S3_BUCKET?.trim();
  if (!bucket) {
    throw new Error('AWS_S3_BUCKET is not configured');
  }
  return bucket;
};

let cachedClient: S3Client | null = null;

export const getS3Client = () => {
  if (!isS3Configured()) {
    throw new Error(
      'S3 is not configured. Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, and AWS_S3_BUCKET.',
    );
  }

  if (!cachedClient) {
    cachedClient = new S3Client({
      region: process.env.AWS_REGION!.trim(),
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!.trim(),
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!.trim(),
      },

      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    });
  }

  return cachedClient;
};

export const MEDIA_CONTENT_TYPES: Record<MediaKind, readonly string[]> = {
  video: ['video/mp4', 'video/webm', 'video/quicktime'],
  pdf: ['application/pdf'],
  cover: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
};

export const MEDIA_MAX_BYTES: Record<MediaKind, number> = {
  video: 2 * 1024 * 1024 * 1024,
  pdf: 50 * 1024 * 1024,
  cover: 5 * 1024 * 1024,
  image: 5 * 1024 * 1024,
};

export const extensionForContentType = (contentType: string): string => {
  const map: Record<string, string> = {
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/quicktime': 'mov',
    'application/pdf': 'pdf',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  };
  return map[contentType] ?? 'bin';
};

export const buildObjectKey = ({
  courseId,
  lectureId,
  kind,
  contentType,
  unique,
}: {
  courseId: number;
  lectureId?: number;
  kind: MediaKind;
  contentType: string;
  unique: string;
}) => {
  const ext = extensionForContentType(contentType);

  if (kind === 'cover') {
    return `courses/${courseId}/cover/${unique}.${ext}`;
  }

  if (!lectureId) {
    throw new Error('lectureId is required for video, pdf, and image uploads');
  }

  return `courses/${courseId}/lectures/${lectureId}/${kind}/${unique}.${ext}`;
};
