import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

class ValidationErrorHandler {
    async handleValidationError(req: Request, res: Response, next: NextFunction) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMsg: string = errors.array().map(error => error.msg).join(". ") + ".";
            res.status(400).json({ error: errorMsg }).send();
        }
        else {
            next();
        }
    }
}

export default new ValidationErrorHandler();