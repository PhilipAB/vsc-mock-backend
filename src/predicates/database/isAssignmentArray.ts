import { OkPacket, ResultSetHeader, RowDataPacket } from 'mysql2/typings/mysql';
import { isNonEmptyRowDataPacketArray } from './isNonEmptyRowDataPacketArray';
import { AssignmentWithId } from '../../models/assignment/AssignmentWithId';
import { AssignmentWithVisibility } from '../../models/assignment/AssignmentWithVisibility';

// Instanceof runtime checks are not working for interfaces since they can not be instantiated
// Type predicate to check if rows are assignable to non-empty assignment array
// https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
export function isAssignmentArray(data: RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader): data is AssignmentWithId[] {
    return (
        // verify that data is type of non-empty RowDataPacket[]
        isNonEmptyRowDataPacketArray(data) &&
        // verify data[0] object key length matches Assignment key length
        Object.keys(data[0]).length === 4 &&
        // check if Assignment properties id, name, repository and description are defined
        data[0].id !== undefined &&
        data[0].name !== undefined &&
        data[0].repository !== undefined &&
        data[0].description !== undefined);
}

export function isAssignmentArrayWithVisibility(data: RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader): data is AssignmentWithVisibility[] {
    return (
        // verify that data is type of non-empty RowDataPacket[]
        isNonEmptyRowDataPacketArray(data) &&
        // verify data[0] object key length matches Assignment key length
        Object.keys(data[0]).length === 6 &&
        // check if Assignment properties id, name, repository and description are defined
        data[0].id !== undefined &&
        data[0].name !== undefined &&
        data[0].repository !== undefined &&
        data[0].description !== undefined &&
        data[0].visible_from !== undefined &&
        data[0].visible_till !== undefined);
}