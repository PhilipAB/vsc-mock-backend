/* In case we do not need to process the id of a user. */
import { RowDataPacket } from "mysql2/typings/mysql";

// Represents the basic user interface the database is returning on requests (must extend RowDataPacket)
export interface BasicUserDB extends RowDataPacket {
    provider_id: number,
    name: string
}