import { Pool } from 'mysql2/promise';
import { BasicUser } from '../models/user/BasicUser';
import { connectionPool } from '../connection/connectionPool';

class UserService {


    promisePool: Pool = connectionPool.promise();

    create(user: BasicUser) {
        return this.promisePool.query("INSERT INTO `User` (`provider_id`, `name`) VALUES(?, ?)", [user.provider_id, user.name]);
    }

    findByProviderId(providerId: number) {
        return this.promisePool.query("SELECT `id`, `name`, `role` FROM `User` WHERE `provider_id` = ?", [providerId]);
    }

    findById(userId: number) {
        return this.promisePool.query("SELECT `id`, `name`, `role` FROM `User` WHERE `id` = ?", [userId]);
    }

    getUserRoleById(userId: number) {
        return this.promisePool.query("SELECT `role` FROM `User` WHERE `id` = ?", [userId]);
    }

    getAll() {
        return this.promisePool.query("SELECT `id`, `name`, `role` FROM `User`");
    }

}

export default new UserService();