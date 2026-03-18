export enum AttendanceType {
  ONLINE = "online",
  PRESENTIAL = "presential",
}

export const ATTENDANCE_TYPE_LABELS: Record<AttendanceType, string> = {
  [AttendanceType.ONLINE]: "Online",
  [AttendanceType.PRESENTIAL]: "Presencial",
};
