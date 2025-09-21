export interface ILeaveRequest {
  id: string;
  userId: string;
  companyId: string;
  departmentId?: string;
  leaveTypeId: string;
  startDate: Date;
  endDate: Date;
  reason?: string;
}
