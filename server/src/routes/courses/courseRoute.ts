import express, { Router } from 'express';
import {
  createCourse,
  getCourseBySlug,
  getCourses,
  getCoursesByInstructor,
  getEnrolledCoursesByUser,
} from '../../controllers/course/courseController.js';
import {
  createLecture,
  createSection,
  deleteCourse,
  deleteLecture,
  deleteSection,
  getInstructorCourseById,
  getInstructorCoursePublishReadiness,
  moveLecture,
  reorderLectures,
  reorderSections,
  updateCourseMetadata,
  updateLecture,
  updateSection,
} from '../../controllers/course/authoring/index.js';
import {
  getLearningCourse,
  markLectureComplete,
  markLectureIncomplete,
  submitLectureQuiz,
} from '../../controllers/course/learning/index.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import {
  authReadLimiter,
  publicGetLimiter,
  sensitiveLimiter,
} from '../../middleware/rate-limit.js';

const courseRouter: Router = express.Router();

courseRouter.route('/').get(publicGetLimiter, getCourses);

courseRouter
  .route('/me/enrolled')
  .get(requireAuth, authReadLimiter, getEnrolledCoursesByUser);

courseRouter
  .route('/me/learn/:courseId')
  .get(requireAuth, authReadLimiter, getLearningCourse);

courseRouter
  .route('/me/learn/:courseId/lectures/:lectureId/complete')
  .post(requireAuth, sensitiveLimiter, markLectureComplete)
  .delete(requireAuth, sensitiveLimiter, markLectureIncomplete);

courseRouter
  .route('/me/learn/:courseId/lectures/:lectureId/quiz/submit')
  .post(requireAuth, sensitiveLimiter, submitLectureQuiz);

courseRouter
  .route('/instructor/me')
  .get(requireAuth, authReadLimiter, getCoursesByInstructor);

courseRouter
  .route('/instructor/courses')
  .post(requireAuth, sensitiveLimiter, createCourse);

courseRouter
  .route('/instructor/courses/:courseId')
  .get(requireAuth, authReadLimiter, getInstructorCourseById)
  .patch(requireAuth, sensitiveLimiter, updateCourseMetadata)
  .delete(requireAuth, sensitiveLimiter, deleteCourse);

courseRouter
  .route('/instructor/courses/:courseId/publish-readiness')
  .get(requireAuth, authReadLimiter, getInstructorCoursePublishReadiness);

courseRouter
  .route('/instructor/courses/:courseId/sections')
  .post(requireAuth, sensitiveLimiter, createSection);

courseRouter
  .route('/instructor/courses/:courseId/sections/reorder')
  .put(requireAuth, sensitiveLimiter, reorderSections);

courseRouter
  .route('/instructor/sections/:sectionId')
  .patch(requireAuth, sensitiveLimiter, updateSection)
  .delete(requireAuth, sensitiveLimiter, deleteSection);

courseRouter
  .route('/instructor/sections/:sectionId/lectures')
  .post(requireAuth, sensitiveLimiter, createLecture);

courseRouter
  .route('/instructor/sections/:sectionId/lectures/reorder')
  .put(requireAuth, sensitiveLimiter, reorderLectures);

courseRouter
  .route('/instructor/lectures/:lectureId')
  .patch(requireAuth, sensitiveLimiter, updateLecture)
  .delete(requireAuth, sensitiveLimiter, deleteLecture);

courseRouter
  .route('/instructor/lectures/:lectureId/move')
  .put(requireAuth, sensitiveLimiter, moveLecture);

courseRouter.route('/:slug').get(publicGetLimiter, getCourseBySlug);

export default courseRouter;
