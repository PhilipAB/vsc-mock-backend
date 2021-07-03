import { Pool } from "mysql2/promise";
import { CourseAssignmentRelation } from "../models/courseAssignmentRelation/CourseAssignmentRelation";
import { connectionPool } from "../connection/connectionPool";
import { CourseAssignmentRelExtended } from "../models/courseAssignmentRelation/CourseAssignmentRelExtended";

class CourseUserRelationService {

    promisePool: Pool = connectionPool.promise();

    create(courseAssignmentRelation: CourseAssignmentRelExtended) {
        return this.promisePool.query(
            "INSERT INTO `CourseAssignmentRelation` (`a_id`, `c_id`, `visible_from`, `visible_till`) VALUES(?, ?, ?, ?)",
            [
                courseAssignmentRelation.assignmentId,
                courseAssignmentRelation.courseId,
                courseAssignmentRelation.visibleFrom?.toISOString().slice(0, 19).replace('T', ' '),
                courseAssignmentRelation.visibleTill?.toISOString().slice(0, 19).replace('T', ' ')
            ]
        );
    }

    update(courseAssignmentRelation: CourseAssignmentRelExtended) {
        return this.promisePool.query(
            "UPDATE `CourseAssignmentRelation`\
            SET `visible_from` = ?, `visible_till` = ?\
            WHERE `a_id` = ? AND `c_id` = ?", [courseAssignmentRelation.visibleFrom?.toISOString().slice(0, 19).replace('T', ' '), courseAssignmentRelation.visibleTill?.toISOString().slice(0, 19).replace('T', ' '), courseAssignmentRelation.assignmentId, courseAssignmentRelation.courseId]);
    }

    getAllCoursesForAssignmentById(assignmentId: number, userId: number) {
        return this.promisePool.query(
            "SELECT `id`, `name` FROM `Course` as `c`\
            JOIN (SELECT `c_id` FROM `CourseAssignmentRelation` WHERE a_id = ?) AS `car` on car.c_id = c.id\
            JOIN (SELECT `c_id` FROM `CourseUserRelation` WHERE u_id = ? AND (role = ? OR role = ?)) AS `cur` on cur.c_id = c.id", [assignmentId, userId, "Teacher", "CourseAdmin"]);
    }
    getAllCoursesForAssignmentByIdWithSearch(assignmentId: number, userId: number, searchString: string) {
        return this.promisePool.query(
            "SELECT `id`, `name` FROM `Course` as `c`\
            JOIN (SELECT `c_id` FROM `CourseAssignmentRelation` WHERE a_id = ?) AS `car` on car.c_id = c.id\
            JOIN (SELECT `c_id` FROM `CourseUserRelation` WHERE u_id = ? AND (role = ? OR role = ?)) AS `cur` on cur.c_id = c.id\
            WHERE `name` like ?", [assignmentId, userId, "Teacher", "CourseAdmin", "%" + searchString + "%"]);
    }

    getAllAssignmentsForCourseById(courseId: number) {
        return this.promisePool.query(
            "SELECT `id`, `name`, `repository`, `description`, `visible_from`, `visible_till`  FROM `CourseAssignmentRelation` AS `car`\
            JOIN (SELECT `id`, `name`, `repository`, `description` FROM `Assignment`) AS `a` on car.a_id = a.id\
            WHERE car.c_id = ?", [courseId]);
    }

    getCoursesNotInCourseAssignmentRelationById(userId: number, assignmentId: number) {
        return this.promisePool.query(
            "SELECT `id`, `name` FROM `CourseUserRelation` AS `cur`\
            JOIN (SELECT `id`, `name`, `creator_id`, `description` FROM `Course`) AS `c` on cur.c_id = c.id\
            WHERE cur.u_id = ? AND (cur.role = ? OR cur.role = ?) AND cur.c_id\
            NOT IN (SELECT `c_id` from `CourseAssignmentRelation` WHERE a_id = ?)", [userId, "Teacher", "CourseAdmin", assignmentId]);
    }

    getCoursesNotInCourseAssignmentRelationByIdWithSearch(userId: number, assignmentId: number, searchString: string) {
        return this.promisePool.query(
            "SELECT `id`, `name` FROM `CourseUserRelation` AS `cur`\
            JOIN (SELECT `id`, `name`, `creator_id`, `description` FROM `Course`) AS `c` on cur.c_id = c.id\
            WHERE cur.u_id = ? AND (cur.role = ? OR cur.role = ?) AND `name` like ? AND cur.c_id\
            NOT IN (SELECT `c_id` from `CourseAssignmentRelation` WHERE a_id = ?)", [userId, "Teacher", "CourseAdmin", "%" + searchString + "%", assignmentId]);
    }

    getAssignmentsNotInCourseAssignmentRelationById(courseId: number) {
        return this.promisePool.query(
            "SELECT `id`, `name`, `repository`, `description` FROM `Assignment` AS `a` WHERE a.id\
            NOT IN (Select `a_id` from `CourseAssignmentRelation` WHERE c_id = ?)", [courseId]);
    }

    delete(courseAssignmentRelation: CourseAssignmentRelation) {
        return this.promisePool.query(
            "DELETE FROM `CourseAssignmentRelation` WHERE `a_id` = ? AND `c_id` = ?", [courseAssignmentRelation.assignmentId, courseAssignmentRelation.courseId]
        );
    }
}

export default new CourseUserRelationService();