import { OkPacket, ResultSetHeader, RowDataPacket } from 'mysql2/typings/mysql';
import { isNonEmptyRowDataPacketArray } from './isNonEmptyRowDataPacketArray';
import { Course } from '../../models/course/Course';

// Instanceof runtime checks are not working for interfaces since they can not be instantiated
// Type predicate to check if rows are assignable to non-empty course array
// https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
export function isCourseArray(data: RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader): data is Course[] {
    return (
        // verify that data is type of non-empty RowDataPacket[]
        isNonEmptyRowDataPacketArray(data) &&
        // verify data[0] object key length matches Course key length
        Object.keys(data[0]).length === 3 &&
        // check if Course properties id, name and creator_id are defined
        data[0].id !== undefined &&
        data[0].name !== undefined &&
        data[0].creator_id !== undefined);
}