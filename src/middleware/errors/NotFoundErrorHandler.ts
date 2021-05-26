import { Request } from "express";
import { Response } from 'express-serve-static-core';

class NotFoundErrorHandler {
    async handleNotFoundError(_req: Request, res: Response) {
        res.status(404).json({ error: "Resource not found!" }).send();
    }
}

export default new NotFoundErrorHandler();