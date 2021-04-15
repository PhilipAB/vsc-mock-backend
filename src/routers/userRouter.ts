import express, { Router } from "express";
import { body } from "express-validator";
import userController from "../controllers/UserController";
import validationErrorHandler from "../middleware/errors/ValidationErrorHandler";

export const userRouter: Router = express.Router();

userRouter.use(express.json());

userRouter.post('/',
    body('name').notEmpty().isString()
        .escape().trim(),
    body('role').isIn(['Student', 'Lecturer']),
    validationErrorHandler.handleValidationError,
    userController.createUser);

userRouter.get('/', userController.getAllUsers);

