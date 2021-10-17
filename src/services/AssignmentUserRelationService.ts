import { Pool } from 'mysql2/promise';
import { AssignmentUserRelation } from '../models/assignmentUserRelation/assignmentUserRelation';
import { connectionPool } from '../connection/connectionPool';

class AssignmentUserRelationService {

    promisePool: Pool = connectionPool.promise();

    create(assignmentUserRelation: AssignmentUserRelation) {
        return this.promisePool.query(
            "INSERT INTO `AssignmentUserRelation` (`u_id`, `a_id`, `solved_tests`, `total_tests`) VALUES(?, ?, ?, ?)",
            [
                assignmentUserRelation.userId,
                assignmentUserRelation.assignmentId,
                assignmentUserRelation.solvedTests,
                assignmentUserRelation.totalTests
            ]
        );
    }

    update(assignmentUserRelation: AssignmentUserRelation) {
        return this.promisePool.query(
            "UPDATE `AssignmentUserRelation`\
            SET `solved_tests` = ?, `total_tests` = ?\
            WHERE `u_id` = ? AND `a_id` = ?", [assignmentUserRelation.solvedTests, assignmentUserRelation.totalTests, assignmentUserRelation.userId, assignmentUserRelation.assignmentId]);
    }

    getAllUsersForAssignmentById(assignmentId: number) {
        return this.promisePool.query(
            "SELECT `name`, `solved_tests`, `total_tests` FROM `AssignmentUserRelation` AS `aur`\
            JOIN (SELECT `id`, `name` FROM `User`) AS `u` on aur.u_id = u.id\
            WHERE aur.a_id = ?", [assignmentId]);
    }
}

export default new AssignmentUserRelationService();