import { Pool } from "mysql2/promise";
import { connectionPool } from "../connection/connectionPool";
import { BasicCourseUserRelation } from "../models/BasicCourseUserRelation";
import { CourseUserRelationRole } from "src/models/CourseUserRelationRole";

export class CourseUserRelationController {

    promisePool: Pool = connectionPool.promise();

    createCourseUserRelation(courseUserRelation: CourseUserRelationRole) {
        return this.promisePool.query(
            "INSERT INTO `CourseUserRelation` (`u_id`, `c_id`, `role`) VALUES(?, ?, ?)", [courseUserRelation.userId, courseUserRelation.courseId, courseUserRelation.role]
        );
    }

    getAllCoursesForSpecificUser(userId: number) {
        return this.promisePool.query(
            "SELECT `c_id` FROM `CourseUserRelation` AS cur\
            JOIN (SELECT `id`, `name`, `creator_id` FROM `Course`) AS `c` on cur.c_id = c.id\
            WHERE cur.u_id = ?", [userId]);
    }

    getAllUsersForSpecificCourse(courseId: number) {
        return this.promisePool.query(
            "SELECT `u_id` FROM `CourseUserRelation` AS cur\
            JOIN (SELECT `id`, `name`, `role` FROM `User`) AS `u` on cur.u_id = u.id\
            WHERE cur.c_id = ?", [courseId]);
    }

    updateStarProperty(courseUserRelation: BasicCourseUserRelation, isStarred: boolean) {
        type boolDisplayedWithNumber = 0 | 1;
        let starred: boolDisplayedWithNumber;
        isStarred ? starred = 1 : starred = 0;
        return this.promisePool.query(
            "UPDATE `Course`\
            SET `is_starred` = ?\
            WHERE `u_id` = ? AND `c_id` =?", [starred, courseUserRelation.userId, courseUserRelation.courseId]);

    }

    updateHiddenProperty(courseUserRelation: BasicCourseUserRelation, isHidden: boolean) {
        type boolDisplayedWithNumber = 0 | 1;
        let hidden: boolDisplayedWithNumber;
        isHidden ? hidden = 1 : hidden = 0;
        return this.promisePool.query(
            "UPDATE `Course`\
            SET `is_hidden` = ?\
            WHERE `u_id` = ? AND `c_id` =?", [hidden, courseUserRelation.userId, courseUserRelation.courseId]);
    }
}