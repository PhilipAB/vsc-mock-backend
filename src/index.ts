import express from 'express';

import * as dotenv from 'dotenv';
dotenv.config({ path: './process.env' });

import { userRouter } from './routers/UserRouter';
import { courseRouter } from './routers/CourseRouter';
import { authenticationRouter } from './routers/authenticationRouter';
import notFoundErrorHandler from './middleware/errors/NotFoundErrorHandler';
import cors from 'cors';

// resource server
const app: express.Application = express();
const port: string | number = process.env.PORT || 3000;

app.use(cors({ origin: "vscode-webview://webviewview-sidebar" }));

// An authentication server could be used for multiple applications. 
// Therefore, in production environment it may be useful isolating authentication functionality to its own server.
// This would ensure that changes to the resource server would not impact the authentication flow. 
app.use('/authenticate', authenticationRouter);

app.use('/users', userRouter);
app.use('/courses', courseRouter);
app.use(notFoundErrorHandler.handleNotFoundError);

app.listen(port, () => {
    console.log('Listening on port: ', port);
});