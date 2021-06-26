/* Simple course with id and description. */
import { RowDataPacket } from "mysql2/typings/mysql";

export interface CourseDescription extends RowDataPacket {
    id: number
    description: string
}