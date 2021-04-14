import express from 'express';
import { CourseController } from './controllers/CourseController';
import { UserController } from './controllers/UserController';
import { BasicUser } from './models/BasicUser';
import { CourseUserRelationController } from './controllers/CourseUserRelationController';
import { isUserArray } from './predicates/isUserArray';
import { body, validationResult } from 'express-validator';
import { UserMiddleware } from './middleware/UserMiddleware';
import { isResultSetHeader } from './predicates/isResultSetHeader';
import { CourseUserRelationRole } from './models/CourseUserRelationRole';
import { CourseRoleType } from './types/CourseRoleType';
import { BasicCoursePwd } from './models/BasicCoursePwd';
import { isCourseArray } from './predicates/isCourseArray';

const app: express.Application = express();
const port: string | number = process.env.PORT || 3000;
const userController: UserController = new UserController();
const courseController: CourseController = new CourseController();
const courseUserRelationController: CourseUserRelationController = new CourseUserRelationController();
const userMiddleware: UserMiddleware = new UserMiddleware();
app.use(express.json());


app.post('/users',
    body('name').notEmpty().isString()
        .escape().trim(),
    body('role').isIn(['Student', 'Lecturer']),
    async (req, res) => {
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

app.get('/users', async (_req, res) => {
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

app.post('/courses',
    body('name').notEmpty().isString()
        .escape().trim(),
    body('password').isString().
        isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches('[0-9]').withMessage('Password must contain a number')
        .matches('[A-Z]').withMessage('Password must contain an uppercase letter')
        .escape().trim(),
    body('creatorId').notEmpty().isNumeric()
        .escape().trim(),
    userMiddleware.valideCourseCreationUserRights,
    async (req: express.Request, res: express.Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json(
                { errors: errors.array() }).send();
        }
        else {
            const course: BasicCoursePwd = req.body;
            try {
                const [result, _fields] = await courseController.createCourse(course);
                if (isResultSetHeader(result)) {
                    try {
                        const courseUserRelation: CourseUserRelationRole = {
                            userId: course.creatorId,
                            courseId: result.insertId,
                            role: CourseRoleType.CourseAdmin
                        }
                        await courseUserRelationController.createCourseUserRelation(courseUserRelation);
                        res.status(201).json({ courseId: result.insertId, courseName: course.name }).send();
                    } catch (error) {
                        res.status(500).json({ errors: error }).send();
                    }
                }
                else {
                    res.status(500).json({ errors: "Course user relation data could not be processed!" }).send();
                }
            } catch (error) {
                res.status(500).json({ errors: error }).send();
            }
        }
    });

app.get('/courses', async (_req, res) => {
    try {
        const [courseRows, _courseFields] = await courseController.getAllCourses();
        // If rows array is empty, return the empty array.
        // If rows array items have same structure as course model, return as course model and send course array as response.  
        // Advantage: Complexity O(1)
        if (Array.isArray(courseRows) && courseRows.length === 0 || isCourseArray(courseRows)) {
            res.status(200).send(courseRows);
        }
        else {
            res.status(500).json({ errors: "Course data could not be processed!" }).send();
        }
    } catch (error) {
        res.status(500).json({ errors: error }).send();
    }
});

app.get("/", (_req, res) => {
    res.send({
        "test": 150
    })
});

app.listen(port, () => {
    console.log('Listening on port: ', port);
});