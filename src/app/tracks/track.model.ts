export interface Track {
  id: string,  // starts null, filled in with Mongo ID
  course: string,
  semester: string,
  status: string
}
