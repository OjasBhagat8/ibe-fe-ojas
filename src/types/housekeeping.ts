export type TaskType = 'DEEP_CLEAN' | 'DAILY_CLEAN' | 'VACANT_CLEAN';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
export type LeaveType = 'PLANNED' | 'SICK';
export type LeaveStatus = 'APPROVED' | 'PENDING' | 'REJECTED';
export type EmploymentType = 'STAFF' | 'SUPERVISOR';

export interface HousekeepingTask {
  taskId: string;
  staffId: string;
  staffName: string;
  assignedByName: string | null;
  roomNumber: string;
  taskDate: string;
  taskStatus: TaskStatus;
  taskType: TaskType | null;
  scheduledStartTime: string | null;
  expectedEndTime: string | null;
  estimatedDurationHours: number | null;
  assignedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  notes: string | null;
  message: string;
}

export interface TaskListResponse {
  staffId: string;
  staffName: string;
  tasks: HousekeepingTask[];
  message: string;
}

export interface AttendanceLog {
  attendanceLogId: string | null;
  staffId: string;
  staffName: string;
  logDate: string;
  clockInTime: string | null;
  clockOutTime: string | null;
  totalWorkedHours: number | null;
  message: string;
}

export interface AttendanceLogItem {
  attendanceLogId: string;
  logDate: string;
  clockInTime: string | null;
  clockOutTime: string | null;
  totalWorkedHours: number | null;
}

export interface AttendanceLogsResponse {
  staffId: string;
  staffName: string;
  message: string;
  logs: AttendanceLogItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
}

export interface LeaveBalance {
  staffId: string;
  staffName: string;
  month: number;
  year: number;
  remainingPlannedLeaves: number;
  remainingSickLeaves: number;
  message: string;
}

export interface LeaveRecord {
  leaveRequestId: string;
  staffId: string;
  staffName: string;
  leaveType: LeaveType;
  leaveStartDate: string;
  leaveEndDate: string;
  totalLeaveDays: number;
  reason: string | null;
  status: LeaveStatus;
  message: string;
}

export interface ActiveLeavesResponse {
  staffId: string;
  staffName: string;
  leaves: LeaveRecord[];
  message: string;
}

export interface HousekeepingAuthState {
  token: string | null;
  staffId: string | null;
  staffName: string | null;
  employmentType: EmploymentType | null;
  propertyId: string | null;
  availabilityStatus: string | null;
  loading: boolean;
  error: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
  propertyId: string;
}

export interface LoginResponse {
  token: string;
  staffId: string;
  staffName: string;
  employmentType: EmploymentType;
  propertyId: string;
  availabilityStatus: string;
}

export interface ApplyLeaveRequest {
  staffId: string;
  leaveType: LeaveType;
  leaveStartDate: string;
  leaveEndDate: string;
  reason: string | null;
}

export interface UpdateTaskStatusRequest {
  status: 'IN_PROGRESS' | 'COMPLETED';
}

export interface DashboardRoomsToday {
  total: number;
  checkingOut: number;
  occupied: number;
  vacant: number;
}

export interface DashboardStaffOnDuty {
  total: number;
  morning: number;
  afternoon: number;
}

export interface DashboardTasksCompleted {
  completed: number;
  total: number;
  completionRate: number;
}

export interface DashboardCapacityStatus {
  status: 'SHORTFALL' | 'NO_DATA';
  deficitHours: number;
  additionalStaffNeeded: number;
}

export interface TaskAllocationRow {
  taskId: string;
  roomNumber: string;
  roomType: string | null;
  assignedTo: string;
  taskStatus: TaskStatus;
  startTime: string | null;
  endTime: string | null;
}

export interface StaffAvailabilityItem {
  staffId: string;
  staffName: string;
  initials: string;
  preferredShift: 'MORNING' | 'AFTERNOON' | null;
  availabilityStatus: 'ON_DUTY' | 'OFF_DUTY' | 'ON_LEAVE' | 'SICK';
}

export interface RoomStatusItem {
  roomNightInventoryId: string;
  roomNumber: string;
  roomType: string | null;
  occupancyStatus: 'VACANT' | 'OCCUPIED' | 'CHECKING_IN' | 'CHECKING_OUT';
  cleanedStatus: 'CLEAN' | 'DIRTY' | 'IN_PROGRESS';
}

export interface TaskOverviewRow {
  taskId: string;
  roomNumber: string | null;
  roomType: string | null;
  taskType: 'DEEP_CLEAN' | 'DAILY_CLEAN' | 'VACANT_CLEAN' | null;
  assignedTo: string;
  shiftName: string | null;
  scheduledStartTime: string | null;
  expectedEndTime: string | null;
  estimatedDurationHours: number | null;
  taskStatus: TaskStatus;
}

export interface SupervisorDashboardOverview {
  date: string;
  roomsToday: DashboardRoomsToday;
  staffOnDuty: DashboardStaffOnDuty;
  tasksCompleted: DashboardTasksCompleted;
  capacityStatus: DashboardCapacityStatus;
  taskAllocation: TaskAllocationRow[];
  staffAvailability: StaffAvailabilityItem[];
}

export type AvailabilityStatus = 'ON_DUTY' | 'OFF_DUTY' | 'ON_LEAVE' | 'SICK';

export interface StaffBoardStaffItem {
  staffId: string;
  staffName: string;
  initials: string;
  role: string;
  availabilityStatus: AvailabilityStatus;
  assignedHours: number;
  shiftCapacityHours: number;
  assignedRooms: string[];
}

export interface StaffBoardShiftGroup {
  shiftName: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  staffCount: number;
  staff: StaffBoardStaffItem[];
}

export interface StaffBoardResponse {
  date: string;
  shifts: StaffBoardShiftGroup[];
}
