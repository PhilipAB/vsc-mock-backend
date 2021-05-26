import { Request, NextFunction } from 'express';
import { Response } from 'express-serve-static-core';
import { validationResult } from 'express-validator';

class ValidationErrorHandler {

    handleGeneralValidationError = (req: Request, res: Response, next: NextFunction) => {
        this.handleValidationError(req, res, next, 400);
    }

    handleTokenValidationError = (req: Request, res: Response, next: NextFunction) => {
        this.handleValidationError(req, res, next, 401);
    }

    private handleValidationError(req: Request, res: Response, next: NextFunction, statusCode: number) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMsg: string = errors.array().map(error => error.msg).join(". ") + ".";
            res.status(statusCode).json({ error: errorMsg }).send();
        }
        else {
            next();
        }
    }
}

export default new ValidationErrorHandler();