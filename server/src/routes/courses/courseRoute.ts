import express, { Router } from 'express';
import {
  getCourseBySlug,
  getCourses,
  getCoursesByInstructor,
  getEnrolledCoursesByUser,
} from '../../controllers/course/courseController.js';
import { requireAuth } from '../../middleware/requireAuth.js';

const courseRouter: Router = express.Router();

courseRouter.route('/').get(getCourses);
courseRouter.route('/me/enrolled').get(requireAuth, getEnrolledCoursesByUser);
courseRouter.route('/instructor/me').get(requireAuth, getCoursesByInstructor);
courseRouter.route('/:slug').get(getCourseBySlug);

export default courseRouter;
