import { Pool } from 'mysql2/promise';
import { BasicAssignment } from '../models/assignment/BasicAssignment';
import { connectionPool } from '../connection/connectionPool';

class AssignmentService {

    promisePool: Pool = connectionPool.promise();

    create(assignment: BasicAssignment) {
        return this.promisePool.query(
            "INSERT INTO `Assignment` (`name`, `repository`, `description`) VALUES(?, ?, ?)", [assignment.name, assignment.repository, assignment.description]
        );
    }

    findById(assignmentId: number) {
        return this.promisePool.query("SELECT `id`, `name`, `repository`, `description` FROM `Assignment` WHERE `id` = ?", [assignmentId]);
    }

    getAll() {
        return this.promisePool.query("SELECT `id`, `name`, `repository`, `description` FROM `Assignment`");
    }
}

export default new AssignmentService();