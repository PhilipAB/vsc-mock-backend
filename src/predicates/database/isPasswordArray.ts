import { OkPacket, ResultSetHeader, RowDataPacket } from 'mysql2/typings/mysql';
import { isNonEmptyRowDataPacketArray } from './isNonEmptyRowDataPacketArray';
import { Password } from '../../models/course/Password';

export function isPasswordArray(data: RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader): data is Password[] {
    return (
        isNonEmptyRowDataPacketArray(data) &&
        Object.keys(data[0]).length === 1 &&
        data[0].password !== undefined);
}