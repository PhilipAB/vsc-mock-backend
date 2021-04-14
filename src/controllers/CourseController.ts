import { Pool } from 'mysql2/promise';
import { BasicCourse } from 'src/models/BasicCourse';
import { connectionPool } from '../connection/connectionPool';
import * as bcrypt from 'bcrypt';

export class CourseController {

    promisePool: Pool = connectionPool.promise();

    async createCourse(course: BasicCourse) {
        const hashedCoursePwd = bcrypt.hash(course.password, 10);
        try {
            return this.promisePool.query(
                "INSERT INTO `Course` (`name`, `password`, `creator_id`) VALUES(?, ?, ?)", [course.name, await hashedCoursePwd, course.creatorId]
            );
        } catch (error) {
            throw error;
        }
    }

    getAllCourses() {
        return this.promisePool.query("SELECT `id`, `name`, `creator_id` FROM `Course`");
    }

    getAllCreatedCourses(creatorId: number) {
        return this.promisePool.query("SELECT `id`, `name`, `creator_id` FROM `Course` WHERE `creator_id` = ?", [creatorId]);
    }

}