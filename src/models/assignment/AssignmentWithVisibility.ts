import { AssignmentWithId } from "./AssignmentWithId";

export interface AssignmentWithVisibility extends AssignmentWithId {
    visible_from: string | null,
    visible_till: string | null
}