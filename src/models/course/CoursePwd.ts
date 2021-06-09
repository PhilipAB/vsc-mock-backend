import { Course } from "./Course";

export interface CoursePwd extends Course {
    password: string
    userId: number
}