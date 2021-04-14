import express from 'express';
import { userRouter } from './routers/UserRouter';
import { courseRouter } from './routers/CourseRouter';

const app: express.Application = express();
const port: string | number = process.env.PORT || 3000;

app.use('/users', userRouter);
app.use('/courses', courseRouter);

app.get("/", (_req, res) => {
    res.send({
        "test": 150
    })
});

app.listen(port, () => {
    console.log('Listening on port: ', port);
});