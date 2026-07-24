import express, { Router } from 'express';
import {
  getCourseBySlug,
  getCourses,
} from '../controllers/courseController.js';

const courseRouter: Router = express.Router();

courseRouter.route('/').get(getCourses);
courseRouter.route('/:slug').get(getCourseBySlug);

export default courseRouter;
