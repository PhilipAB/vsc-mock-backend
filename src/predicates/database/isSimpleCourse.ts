import { OkPacket, ResultSetHeader, RowDataPacket } from 'mysql2/typings/mysql';
import { isNonEmptyRowDataPacketArray } from './isNonEmptyRowDataPacketArray';
import { SimpleCourse } from '../../models/course/SimpleCourse';

// Instanceof runtime checks are not working for interfaces since they can not be instantiated
// Type predicate to check if rows are assignable to non-empty course array
// https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
export function isSimpleCourseArray(data: RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader): data is SimpleCourse[] {
    return (
        // verify that data is type of non-empty RowDataPacket[]
        isNonEmptyRowDataPacketArray(data) &&
        // verify data[0] object key length matches Course key length
        Object.keys(data[0]).length === 2 &&
        // check if Course properties id, name, creator_id and description are defined
        data[0].id !== undefined &&
        data[0].name !== undefined);
}