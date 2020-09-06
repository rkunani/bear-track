export interface Track {
  id: string,  // starts null, filled in with Mongo ID
  course_id: number,
  course_code: string,
  semester: string,
  status: string
}
