import { Pool } from "mysql2/promise";
import { CourseAssignmentRelation } from "../models/courseAssignmentRelation/CourseAssignmentRelation";
import { connectionPool } from "../connection/connectionPool";

class CourseUserRelationService {

    promisePool: Pool = connectionPool.promise();

    create(courseAssignmentRelation: CourseAssignmentRelation) {
        return this.promisePool.query(
            "INSERT INTO `CourseAssignmentRelation` (`a_id`, `c_id`) VALUES(?, ?)", [courseAssignmentRelation.assignmentId, courseAssignmentRelation.courseId]
        );
    }

    getAllCoursesForAssignmentById(assignmentId: number) {
        return this.promisePool.query(
            "SELECT `c_id` AS id, `name` FROM `CourseAssignmentRelation` AS car\
            JOIN (SELECT `id`, `name` FROM `Course`) AS `c` on car.c_id = c.id\
            WHERE car.a_id = ?", [assignmentId]);
    }

    getAllAssignmentsForCourseById(courseId: number) {
        return this.promisePool.query(
            "SELECT `id`, `name`, `repository`, `description` FROM `CourseAssignmentRelation` AS car\
            JOIN (SELECT `id`, `name`, `repository`, `description` FROM `Assignment`) AS `a` on car.a_id = a.id\
            WHERE car.c_id = ?", [courseId]);
    }
}

export default new CourseUserRelationService();