import express, { Router } from "express";
import { body } from "express-validator";
import userController from "../controllers/UserController";
import validationErrorHandler from "../middleware/errors/ValidationErrorHandler";
import userMiddleware from "../middleware/auth/UserMiddleware";
import assignmentController from "../controllers/AssignmentController";

export const userRouter: Router = express.Router();

userRouter.use(express.json());

userRouter.post('/',
    userMiddleware.authenticateUser,
    userMiddleware.valideAdminRights,
    body('name').notEmpty().isString()
        .escape().trim(),
    body('role').isIn(['Student', 'Lecturer']),
    validationErrorHandler.handleGeneralValidationError,
    userController.createUser);

userRouter.get('/profile',
    userMiddleware.authenticateUser,
    userController.getUserById);

userRouter.get('/', userController.getAllUsers);

userRouter.get('/assignment/:id',
    userMiddleware.authenticateUser,
    userMiddleware.valideCreationUserRights,
    assignmentController.getUsersByAssignmentId);

