import { OkPacket, ResultSetHeader, RowDataPacket } from 'mysql2/typings/mysql';

// Type predicate to verify the type ResultHeader
// We expect SQL Insert queries to return a ResultSetHeader.
export function isResultSetHeader(data: RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader): data is ResultSetHeader {
    return (
        // check if property insertId on data exists to exclude array return types RowDataPacket[], RowDataPacket[][] and OkPacket[]
        data.hasOwnProperty('insertId') &&
        // check if property changedRows on data does not exist to exclude OkPacket return type
        !data.hasOwnProperty('changedRows')  
    )
}