import { OkPacket, ResultSetHeader, RowDataPacket } from 'mysql2/typings/mysql';

// Type predicate to verify the type RowDataPacket[] 
// We expect SQL Select queries to return a RowDataPacket array.
export function isNonEmptyRowDataPacketArray(data: RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader): data is RowDataPacket[] {
    return (
        // check if data is array to exclude return types OkPacket and ResultSetHeader
        Array.isArray(data) &&
        // check if array is not empty to verify data[0] exists
        data.length > 0 &&
        // check if data is no multidimension array to exclude return type RowDataPacket[][]
        !Array.isArray(data[0]) &&
        // check if data[0] does not define property "fieldCount" to exlude return type OkPacket 
        !data[0].hasOwnProperty('fieldCount')
        // -> return type is RowDataPacket[] 
    )
}