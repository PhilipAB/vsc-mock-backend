import express, { Router } from "express";
import { body } from "express-validator";
import courseController from "../controllers/CourseController";
import userMiddleware from "../middleware/auth/UserMiddleware";

import validationErrorHandler from "../middleware/errors/ValidationErrorHandler";

export const courseRouter: Router = express.Router();

courseRouter.use(express.json());

courseRouter.post('/',
    body('name').notEmpty().isString()
        .escape().trim(),
    body('password').isString().
        isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches('[0-9]').withMessage('Password must contain a number')
        .matches('[A-Z]').withMessage('Password must contain an uppercase letter')
        .escape().trim(),
    validationErrorHandler.handleGeneralValidationError,
    userMiddleware.authenticateUser,
    userMiddleware.valideCourseCreationUserRights,
    courseController.createCourse);

courseRouter.get('/', courseController.getAllCourses);