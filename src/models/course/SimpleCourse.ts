/* Simple course with id and name. */
import { RowDataPacket } from "mysql2/typings/mysql";

export interface SimpleCourse extends RowDataPacket {
    id: number
    name: string
}