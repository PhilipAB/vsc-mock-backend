import { Pool } from 'mysql2/promise';
import { BasicUser } from 'src/models/BasicUser';
import { connectionPool } from '../connection/connectionPool';

export class UserController {


    promisePool: Pool = connectionPool.promise();

    createUser(user: BasicUser) {
        return this.promisePool.query("INSERT INTO `User` (`name`, `role`) VALUES(?, ?)", [user.name, user.role]);
    }

    getUserRoleById(id: number) {
        return this.promisePool.query("SELECT `role` FROM `User` WHERE `id` = ?", [id]);
    }

    getAllUsers() {
        return this.promisePool.query("SELECT * FROM `User`");
    }

}

