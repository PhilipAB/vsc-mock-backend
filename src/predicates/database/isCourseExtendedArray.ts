import { OkPacket, ResultSetHeader, RowDataPacket } from 'mysql2/typings/mysql';
import { CourseExtended } from '../../models/course/CourseExtended';
import { isNonEmptyRowDataPacketArray } from './isNonEmptyRowDataPacketArray';

// Instanceof runtime checks are not working for interfaces since they can not be instantiated
// Type predicate to check if rows are assignable to non-empty course array
// https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
export function isCourseExtendedArray(data: RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader): data is CourseExtended[] {
    return (
        // verify that data is type of non-empty RowDataPacket[]
        isNonEmptyRowDataPacketArray(data) &&
        // verify data[0] object key length matches CourseExtended key length
        Object.keys(data[0]).length === 7 &&
        // check if Course properties course_id, name, hidden, starred and role are defined
        data[0].course_id !== undefined &&
        data[0].name !== undefined &&
        data[0].hidden !== undefined &&
        data[0].starred !== undefined &&
        data[0].role !== undefined &&
        data[0].description !== undefined &&
        data[0].visited !== undefined);
}