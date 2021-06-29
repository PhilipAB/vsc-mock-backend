import { CourseAssignmentRelation } from "./CourseAssignmentRelation";

export interface CourseAssignmentRelExtended extends CourseAssignmentRelation {
    visibleFrom: Date | null
    visibleTill: Date | null
}