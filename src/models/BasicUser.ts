/* In case we do not need to process the id of a user. */
import { RowDataPacket } from "mysql2/typings/mysql";
import { UserRoleType } from "src/types/UserRoleType";

export interface BasicUser extends RowDataPacket {
    name: string,
    role: UserRoleType
}