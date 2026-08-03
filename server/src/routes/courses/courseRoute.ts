import express, { Router } from 'express';
import {
  getCourseBySlug,
  getCourses,
} from '../../controllers/course/courseController.js';

const courseRouter: Router = express.Router();

courseRouter.route('/').get(getCourses);
courseRouter.route('/:slug').get(getCourseBySlug);

export default courseRouter;
