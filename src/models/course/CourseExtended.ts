import { RowDataPacket } from "mysql2/typings/mysql";
import { CourseRoleType } from "src/types/roles/CourseRoleType";

export interface CourseExtended extends RowDataPacket {
    course_id: number,
    name: string,
    hidden: boolean,
    starred: boolean,
    role: CourseRoleType
}