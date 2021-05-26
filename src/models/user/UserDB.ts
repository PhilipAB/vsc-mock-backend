import { UserRoleType } from "../../types/roles/UserRoleType";
import { BasicUserDB } from "./BasicUserDB";

export interface UserDB extends BasicUserDB {
    id: number,
    role: UserRoleType
}