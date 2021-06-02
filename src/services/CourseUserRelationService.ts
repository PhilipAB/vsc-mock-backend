import { Pool } from "mysql2/promise";
import { connectionPool } from "../connection/connectionPool";
import { CourseUserRelationRole } from "../models/courseUserRelation/CourseUserRelationRole";
import { CourseUserRelationHidden } from "../models/courseUserRelation/CourseUserRelationHidden";
import { CourseUserRelationStarred } from "../models/courseUserRelation/CourseUserRelationStarred";

class CourseUserRelationService {

    promisePool: Pool = connectionPool.promise();

    create(courseUserRelation: CourseUserRelationRole) {
        return this.promisePool.query(
            "INSERT INTO `CourseUserRelation` (`u_id`, `c_id`, `role`) VALUES(?, ?, ?)", [courseUserRelation.userId, courseUserRelation.courseId, courseUserRelation.role]
        );
    }

    getAllCoursesForUserById(userId: number) {
        return this.promisePool.query(
            "SELECT `c_id` AS course_id, `name`, `hidden`, `starred`, `role` FROM `CourseUserRelation` AS cur\
            JOIN (SELECT `id`, `name`, `creator_id` FROM `Course`) AS `c` on cur.c_id = c.id\
            WHERE cur.u_id = ?", [userId]);
    }

    getAllUsersForCourseById(courseId: number) {
        return this.promisePool.query(
            "SELECT `u_id` FROM `CourseUserRelation` AS cur\
            JOIN (SELECT `id`, `name`, `role` FROM `User`) AS `u` on cur.u_id = u.id\
            WHERE cur.c_id = ?", [courseId]);
    }

    updateRoleProperty(courseUserRelation: CourseUserRelationRole) {
        return this.promisePool.query(
            "UPDATE `CourseUserRelation`\
            SET `role` = ?\
            WHERE `u_id` = ? AND `c_id` =?", [courseUserRelation.role, courseUserRelation.userId, courseUserRelation.courseId]);

    }

    updateStarProperty(courseUserRelation: CourseUserRelationStarred) {
        type boolDisplayedWithNumber = 0 | 1;
        let starred: boolDisplayedWithNumber;
        courseUserRelation.starred ? starred = 1 : starred = 0;
        return this.promisePool.query(
            "UPDATE `CourseUserRelation`\
            SET `starred` = ?\
            WHERE `u_id` = ? AND `c_id` =?", [starred, courseUserRelation.userId, courseUserRelation.courseId]);

    }

    updateHiddenProperty(courseUserRelation: CourseUserRelationHidden) {
        type boolDisplayedWithNumber = 0 | 1;
        let hidden: boolDisplayedWithNumber;
        courseUserRelation.hidden ? hidden = 1 : hidden = 0;
        return this.promisePool.query(
            "UPDATE `CourseUserRelation`\
            SET `hidden` = ?\
            WHERE `u_id` = ? AND `c_id` =?", [hidden, courseUserRelation.userId, courseUserRelation.courseId]);
    }
}

export default new CourseUserRelationService();