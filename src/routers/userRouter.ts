import express, { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { isResultSetHeader } from "../predicates/isResultSetHeader";
import { UserController } from "../controllers/UserController";
import { BasicUser } from "../models/BasicUser";
import { isUserArray } from "../predicates/isUserArray";


export const userRouter: Router = express.Router();
const userController: UserController = new UserController();

userRouter.use(express.json());

userRouter.post('/',
    body('name').notEmpty().isString()
        .escape().trim(),
    body('role').isIn(['Student', 'Lecturer']),
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() }).send();
        }
        else {
            const user: BasicUser = req.body;
            try {
                const [result, _fields] = await userController.createUser(user);
                if (isResultSetHeader(result)) {
                    res.status(201).json({ courseId: result.insertId, courseName: user.name }).send();
                }
            } catch (error) {
                res.status(500).json({ errors: error }).send();
            }
        }
    });

userRouter.get('/', async (_req: Request, res: Response) => {
    try {
        const [rows, _fields] = await userController.getAllUsers();
        // If rows array is empty, return the empty array.
        // If rows array items have same structure as user model, return as user model and send user array as response.  
        // Advantage: Complexity O(1)
        if (Array.isArray(rows) && rows.length === 0 || isUserArray(rows)) {
            res.status(200).send(rows);
        }
        else {
            res.status(500).json({ errors: "User data could not be processed!" }).send();
        }
    } catch (error) {
        res.status(500).json({ errors: error }).send();
    }
});
