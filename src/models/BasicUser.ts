/* In case we do not need to process the id of a user. */ 
import { RoleType } from "src/types/RoleType";

export interface BasicUser {
    name: string,
    role: RoleType
}