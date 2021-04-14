import { Pool } from 'mysql2/promise';
import { BasicCourse } from 'src/models/BasicCourse';
import { connectionPool } from '../connection/connectionPool';

export class CourseController {

    promisePool: Pool = connectionPool.promise();

    async createCourse(course: BasicCourse) {
        return this.promisePool.query(
            "INSERT INTO `Course` (`name`, `password`, `creator_id`) VALUES(?, ?, ?)", [course.name, course.password, course.creatorId]
        );
    }

    getAllCourses() {
        return this.promisePool.query("SELECT `id`, `name`, `creator_id` FROM `Course`");
    }

    getAllCreatedCourses(creatorId: number) {
        return this.promisePool.query("SELECT `id`, `name`, `creator_id` FROM `Course` WHERE `creator_id` = ?", [creatorId]);
    }

}