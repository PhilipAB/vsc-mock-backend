import { BasicUser } from '../models/BasicUser';
import { Request, Response } from 'express';
import { isResultSetHeader } from '../predicates/isResultSetHeader';
import userService from '../services/UserService';
import { isUserArray } from '../predicates/isUserArray';

class UserController {

    async createUser(req: Request, res: Response) {
        const user: BasicUser = req.body;
        try {
            const [result, _fields] = await userService.create(user);
            if (isResultSetHeader(result)) {
                res.status(201).json({ courseId: result.insertId, courseName: user.name }).send();
            }
        } catch (error) {
            res.status(500).json({ error: error }).send();
        }
    }

    async getAllUsers(_req: Request, res: Response) {
        try {
            const [rows, _fields] = await userService.getAll();
            // If rows array is empty, return the empty array.
            // If rows array items have same structure as user model, return as user model and send user array as response.  
            // Advantage: Complexity O(1)
            if (Array.isArray(rows) && rows.length === 0 || isUserArray(rows)) {
                res.status(200).send(rows);
            }
            else {
                res.status(500).json({ error: "User data could not be processed!" }).send();
            }
        } catch (error) {
            res.status(500).json({ error: error }).send();
        }
    }
}

export default new UserController();

