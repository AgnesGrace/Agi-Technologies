import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getAuth } from '@clerk/express';
import { Request, Response } from 'express';
import { nanoid } from 'nanoid';
import db from '../../db/db.js';
import { logger } from '../../utils/logger.js';
import { createSignedObjectGetUrl } from '../../services/course-cover-image-url.js';
import {
  MEDIA_CONTENT_TYPES,
  MEDIA_MAX_BYTES,
  MediaKind,
  buildObjectKey,
  getS3Bucket,
  getS3Client,
  isS3Configured,
} from '../../utils/s3.js';
import {
  parsePositiveInt,
  requireInstructorUser,
  requireOwnedCourse,
} from '../course/courseOwnership.js';

const UPLOAD_URL_TTL_SECONDS = 60 * 15;
const DOWNLOAD_URL_TTL_SECONDS = 60 * 60;

const parseKind = (value: unknown): MediaKind | null => {
  if (
    value === 'video' ||
    value === 'pdf' ||
    value === 'cover' ||
    value === 'image'
  ) {
    return value;
  }
  return null;
};

const assertS3Ready = (res: Response): boolean => {
  if (isS3Configured()) return true;
  res.status(503).json({
    status: 'fail',
    message:
      'File storage is not configured. Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, and AWS_S3_BUCKET.',
  });
  return false;
};

const assertLearnerOrOwnerAccess = async (userId: string, courseId: number) => {
  const [enrollment, course] = await Promise.all([
    db.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      select: { id: true },
    }),
    db.course.findUnique({
      where: { id: courseId },
      select: { id: true, instructorId: true },
    }),
  ]);

  if (!course) {
    return {
      ok: false as const,
      status: 404 as const,
      message: 'Course not found.',
    };
  }

  if (enrollment || course.instructorId === userId) {
    return { ok: true as const, course };
  }

  const actor = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (actor?.role === 'ADMIN') {
    return { ok: true as const, course };
  }

  return {
    ok: false as const,
    status: 403 as const,
    message: 'Enroll in this course to access media.',
  };
};

type PresignUploadBody = {
  courseId?: number;
  lectureId?: number;
  kind?: string;
  contentType?: string;
  fileName?: string;
  fileSize?: number;
};

export const createUploadPresign = async (
  req: Request<{}, {}, PresignUploadBody>,
  res: Response,
): Promise<void> => {
  try {
    if (!assertS3Ready(res)) return;

    const auth = await requireInstructorUser(req, res);
    if (!auth) return;

    const courseId = parsePositiveInt(
      req.body?.courseId != null ? String(req.body.courseId) : undefined,
    );
    const kind = parseKind(req.body?.kind);
    const contentType =
      typeof req.body?.contentType === 'string'
        ? req.body.contentType.trim().toLowerCase()
        : '';
    const fileSize =
      typeof req.body?.fileSize === 'number'
        ? req.body.fileSize
        : Number.parseInt(String(req.body?.fileSize ?? ''), 10);

    if (!courseId || !kind || !contentType) {
      res.status(400).json({
        status: 'fail',
        message: 'courseId, kind, and contentType are required.',
      });
      return;
    }

    if (!MEDIA_CONTENT_TYPES[kind].includes(contentType)) {
      res.status(400).json({
        status: 'fail',
        message: `Unsupported content type for ${kind}. Allowed: ${MEDIA_CONTENT_TYPES[kind].join(', ')}`,
      });
      return;
    }

    if (!Number.isFinite(fileSize) || fileSize <= 0) {
      res.status(400).json({
        status: 'fail',
        message: 'fileSize must be a positive number of bytes.',
      });
      return;
    }

    if (fileSize > MEDIA_MAX_BYTES[kind]) {
      res.status(400).json({
        status: 'fail',
        message: `File exceeds the ${kind} size limit.`,
      });
      return;
    }

    const course = await requireOwnedCourse(courseId, auth.userId, res);
    if (!course) return;

    let lectureId: number | undefined;
    if (kind === 'video' || kind === 'pdf' || kind === 'image') {
      const parsedLectureId = parsePositiveInt(
        req.body?.lectureId != null ? String(req.body.lectureId) : undefined,
      );
      if (!parsedLectureId) {
        res.status(400).json({
          status: 'fail',
          message: 'lectureId is required for video, pdf, and image uploads.',
        });
        return;
      }
      lectureId = parsedLectureId;

      const lecture = await db.lecture.findFirst({
        where: {
          id: lectureId,
          section: { courseId },
        },
        select: { id: true },
      });

      if (!lecture) {
        res.status(404).json({
          status: 'fail',
          message: 'Lecture not found in this course.',
        });
        return;
      }
    }

    const key = buildObjectKey({
      courseId,
      kind,
      contentType,
      unique: nanoid(12),
      ...(lectureId != null ? { lectureId } : {}),
    });

    const command = new PutObjectCommand({
      Bucket: getS3Bucket(),
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(getS3Client(), command, {
      expiresIn: UPLOAD_URL_TTL_SECONDS,
    });

    res.status(200).json({
      status: 'success',
      message: 'Upload URL created.',
      data: {
        uploadUrl,
        key,
        headers: {
          'Content-Type': contentType,
        },
        expiresIn: UPLOAD_URL_TTL_SECONDS,
      },
    });
  } catch (error) {
    logger.error(
      { err: error, requestId: req.requestId },
      'Error creating upload presign',
    );
    res.status(500).json({
      status: 'error',
      message: 'Unable to create upload URL.',
    });
  }
};

type PresignDownloadBody = {
  courseId?: number;
  lectureId?: number;
  kind?: string;
  key?: string;
};

export const createDownloadPresign = async (
  req: Request<{}, {}, PresignDownloadBody>,
  res: Response,
): Promise<void> => {
  try {
    if (!assertS3Ready(res)) return;

    const { userId } = getAuth(req);

    if (!userId) {
      res.status(401).json({ status: 'fail', message: 'Unauthorized' });
      return;
    }

    const courseId = parsePositiveInt(
      req.body?.courseId != null ? String(req.body.courseId) : undefined,
    );
    const kind = parseKind(req.body?.kind);

    if (!courseId || !kind) {
      res.status(400).json({
        status: 'fail',
        message: 'courseId and kind are required.',
      });
      return;
    }

    const access = await assertLearnerOrOwnerAccess(userId, courseId);
    if (!access.ok) {
      res.status(access.status).json({
        status: 'fail',
        message: access.message,
      });
      return;
    }

    let key: string | null = null;

    if (kind === 'cover') {
      const course = await db.course.findUnique({
        where: { id: courseId },
        select: { image: true },
      });
      key = course?.image ?? null;
    } else if (kind === 'image') {
      const rawKey =
        typeof req.body?.key === 'string' ? req.body.key.trim() : '';
      if (!rawKey) {
        res.status(400).json({
          status: 'fail',
          message: 'key is required for image downloads.',
        });
        return;
      }
      key = rawKey;
    } else {
      const lectureId = parsePositiveInt(
        req.body?.lectureId != null ? String(req.body.lectureId) : undefined,
      );
      if (!lectureId) {
        res.status(400).json({
          status: 'fail',
          message: 'lectureId is required for video and pdf downloads.',
        });
        return;
      }

      const lecture = await db.lecture.findFirst({
        where: {
          id: lectureId,
          section: { courseId },
        },
        select: { videoKey: true, pdfKey: true },
      });

      if (!lecture) {
        res.status(404).json({
          status: 'fail',
          message: 'Lecture not found in this course.',
        });
        return;
      }

      key = kind === 'video' ? lecture.videoKey : lecture.pdfKey;
    }

    if (!key) {
      res.status(404).json({
        status: 'fail',
        message: 'No media attached for this asset.',
      });
      return;
    }

    const expectedPrefix = `courses/${courseId}/`;
    if (!key.startsWith(expectedPrefix)) {
      res.status(400).json({
        status: 'fail',
        message: 'Invalid media key for this course.',
      });
      return;
    }

    if (kind === 'image' && !key.includes('/image/')) {
      res.status(400).json({
        status: 'fail',
        message: 'Invalid lesson image key.',
      });
      return;
    }

    const downloadUrl = await createSignedObjectGetUrl(
      key,
      DOWNLOAD_URL_TTL_SECONDS,
    );

    res.status(200).json({
      status: 'success',
      data: {
        downloadUrl,
        key,
        expiresIn: DOWNLOAD_URL_TTL_SECONDS,
      },
    });
  } catch (error) {
    logger.error(
      { err: error, requestId: req.requestId },
      'Error creating download presign',
    );
    res.status(500).json({
      status: 'error',
      message: 'Unable to create download URL.',
    });
  }
};
