import { BasicUser } from '../models/user/BasicUser';
import { Request } from 'express';
import { Response } from 'express-serve-static-core';
import { isResultSetHeader } from '../predicates/database/isResultSetHeader';
import userService from '../services/UserService';
import { isUserArray } from '../predicates/database/isUserArray';

class UserController {

    async findOrCreateUser(user: BasicUser): Promise<number> {
        try {
            const [existingUser, _fields] = await userService.findByProviderId(user.provider_id);
            if (isUserArray(existingUser)) {
                return existingUser[0].id;
            }
            else {
                const [newUser, _fields] = await userService.create(user);
                if (isResultSetHeader(newUser)) {
                    return newUser.insertId;
                }
                else {
                    throw new Error("Data could not be processed!");
                }
            }
        } catch (error) {
            throw new Error(error);
        }
    }

    async createUser(req: Request, res: Response) {
        const user: BasicUser = req.body;
        try {
            const [result, _fields] = await userService.create(user);
            if (isResultSetHeader(result)) {
                res.status(201).json({ userId: result.insertId, userName: user.name }).send();
            }
            else {
                res.status(500).json({ error: "User data could not be processed!" }).send();
            }
        } catch (error) {
            res.status(500).json({ error: error }).send();
        }
    }

    async getUserById(req: Request, res: Response) {
        try {
            const userId: number = req.body.userId;
            const [user, _fields] = await userService.findById(userId);
            if (isUserArray(user)) {
                console.log(user[0]);
                res.status(200).send(user[0]);
            }
            else {
                res.status(500).json({ error: "User data could not be processed!" }).send();
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

