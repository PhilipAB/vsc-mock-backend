/* In case we do not need to process the password of a course. */
import { BasicCourse } from "./BasicCourse";

export interface Course extends BasicCourse {
    id: number
}