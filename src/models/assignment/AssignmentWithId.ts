import { RowDataPacket } from "mysql2/typings/mysql";

export interface AssignmentWithId extends RowDataPacket {
    id: number
    name: string,
    repository: string, //repository link of an assignment
    description: string
}