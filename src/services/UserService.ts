import { Pool } from 'mysql2/promise';
import { BasicUser } from '../models/BasicUser';
import { connectionPool } from '../connection/connectionPool';

class UserService {


    promisePool: Pool = connectionPool.promise();

    create(user: BasicUser) {
        return this.promisePool.query("INSERT INTO `User` (`name`, `role`) VALUES(?, ?)", [user.name, user.role]);
    }

    getUserRoleById(id: number) {
        return this.promisePool.query("SELECT `role` FROM `User` WHERE `id` = ?", [id]);
    }

    getAll() {
        return this.promisePool.query("SELECT * FROM `User`");
    }

}

export default new UserService();