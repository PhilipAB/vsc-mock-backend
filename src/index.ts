import express from 'express';
import { userRouter } from './routers/UserRouter';
import { courseRouter } from './routers/CourseRouter';
import notFoundErrorHandler from './middleware/errors/NotFoundErrorHandler'

const app: express.Application = express();
const port: string | number = process.env.PORT || 3000;

app.use('/users', userRouter);
app.use('/courses', courseRouter);
app.use(notFoundErrorHandler.handleNotFoundError);

app.listen(port, () => {
    console.log('Listening on port: ', port);
});