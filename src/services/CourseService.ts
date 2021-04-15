import { Pool } from 'mysql2/promise';
import { BasicCourse } from 'src/models/BasicCourse';
import { connectionPool } from '../connection/connectionPool';

class CourseService {

    promisePool: Pool = connectionPool.promise();

    create(course: BasicCourse) {
        return this.promisePool.query(
            "INSERT INTO `Course` (`name`, `password`, `creator_id`) VALUES(?, ?, ?)", [course.name, course.password, course.creatorId]
        );
    }

    getAll() {
        return this.promisePool.query("SELECT `id`, `name`, `creator_id` FROM `Course`");
    }

    getAllCreatedCoursesById(creatorId: number) {
        return this.promisePool.query("SELECT `id`, `name`, `creator_id` FROM `Course` WHERE `creator_id` = ?", [creatorId]);
    }
}

export default new CourseService();