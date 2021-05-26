import { BasicCourseUserRelation } from "./BasicCourseUserRelation";

/* In case we only need to process the starred property of a course user relation. */
export interface CourseUserRelationStarred extends BasicCourseUserRelation {
    starred: boolean
}