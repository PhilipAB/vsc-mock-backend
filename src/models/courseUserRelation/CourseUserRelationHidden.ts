import { BasicCourseUserRelation } from "./BasicCourseUserRelation";

/* In case we only need to process the hidden property of a course user relation. */
export interface CourseUserRelationHidden extends BasicCourseUserRelation {
    hidden: boolean
}