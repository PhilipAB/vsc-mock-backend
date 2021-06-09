import { Pool } from 'mysql2/promise';
import { BasicCourse } from '../models/course/BasicCourse';
import { connectionPool } from '../connection/connectionPool';

class CourseService {

    promisePool: Pool = connectionPool.promise();

    create(course: BasicCourse) {
        return this.promisePool.query(
            "INSERT INTO `Course` (`name`, `password`, `creator_id`) VALUES(?, ?, ?)", [course.name, course.password, course.userId]
        );
    }

    getAll() {
        return this.promisePool.query("SELECT `id`, `name`, `creator_id` FROM `Course`");
    }

    getAllCreatedCoursesById(creatorId: number) {
        return this.promisePool.query("SELECT `id`, `name`, `creator_id` FROM `Course` WHERE `creator_id` = ?", [creatorId]);
    }

    // Encrypted password. Should only be used internally, to verify password upon registration for a course. 
    getPasswordById(courseId: number) {
        return this.promisePool.query("SELECT `password` FROM `Course` WHERE `id` = ?", [courseId]);
    }
}

export default new CourseService();