import { Pool } from 'mysql2/promise';
import { BasicCoursePwd } from '../models/course/BasicCoursePwd';
import { connectionPool } from '../connection/connectionPool';

class CourseService {

    promisePool: Pool = connectionPool.promise();

    create(course: BasicCoursePwd) {
        return this.promisePool.query(
            "INSERT INTO `Course` (`name`, `password`, `creator_id`, `description`) VALUES(?, ?, ?, ?)", [course.name, course.password, course.userId, course.description]
        );
    }

    getAll() {
        return this.promisePool.query("SELECT `id`, `name`, `description`, `creator_id` FROM `Course`");
    }

    // ToDo: Include description
    getAllCreatedCoursesById(creatorId: number) {
        return this.promisePool.query("SELECT `id`, `name`, `creator_id` FROM `Course` WHERE `creator_id` = ?", [creatorId]);
    }

    // Encrypted password. Should only be used internally, to verify password upon registration for a course. 
    getPasswordById(courseId: number) {
        return this.promisePool.query("SELECT `password` FROM `Course` WHERE `id` = ?", [courseId]);
    }
}

export default new CourseService();