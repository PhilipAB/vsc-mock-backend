import { RowDataPacket } from "mysql2/typings/mysql";

export interface CoursePwd extends RowDataPacket {
    id: number,
    name: string,
    userId: number //creatorId of a course
    password: string
}