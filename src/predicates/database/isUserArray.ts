import { OkPacket, ResultSetHeader, RowDataPacket } from 'mysql2/typings/mysql';
import { isNonEmptyRowDataPacketArray } from './isNonEmptyRowDataPacketArray';
import { UserDB } from '../../models/user/UserDB';

// Instanceof runtime checks are not working for interfaces since they can not be instantiated
// Type predicate to check if rows are assignable to non-empty user array
// https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
export function isUserArray(data: RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader): data is UserDB[] {
    return (
        // verify that data is type of non-empty RowDataPacket[]
        isNonEmptyRowDataPacketArray(data) &&
        // verify data[0] object key length matches Users key length
        Object.keys(data[0]).length === 4 &&
        // check if User properties id, name and role are defined
        data[0].id !== undefined &&
        data[0].provider_id !== undefined &&
        data[0].name !== undefined &&
        data[0].role !== undefined);
}