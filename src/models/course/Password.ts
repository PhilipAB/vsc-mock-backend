import { RowDataPacket } from "mysql2/typings/mysql";

export interface Password extends RowDataPacket {
    password: string
}