import { Pool } from 'mysql2/promise';
import { connectionPool } from '../connection/connectionPool';

class CourseAccessService {

    promisePool: Pool = connectionPool.promise();

    create(courseId: number) {
        return this.promisePool.query(
            "INSERT INTO `CourseAccess` (`c_id`, `accessed`) VALUES(?, UTC_TIMESTAMP())", [courseId]
        );
    }

    // returns total course access for the last seven days
    getTotalCourseAccess(courseId: number) {
        return this.promisePool.query("SELECT COUNT(*) FROM `CourseAccess` WHERE `accessed` > DATE_SUB(NOW(),INTERVAL 7 DAY)\
        AND `c_id` =?", [courseId]);
    }

    // returns total number of users who accessed the course during the last seven days
    getCourseAccessByUsers(courseId: number) {
        return this.promisePool.query("SELECT COUNT(*) FROM `CourseUserRelation` WHERE visited > DATE_SUB(NOW(),INTERVAL 7 DAY)\
        AND `c_id` =?", [courseId]);
    }
}

export default new CourseAccessService();