/* In case we do not need to process the id and password of a course. */
import { RowDataPacket } from "mysql2/typings/mysql";

export interface BasicCourse extends RowDataPacket {
    name: string,
    creatorId: number
}