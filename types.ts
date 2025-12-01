export interface Employee {
  id: string;
  code: string;
  name: string;
  baseSalary: number;
  isActive: boolean;
}

export type ServiceType = '60%' | '100%';

export interface OvertimeRecord {
  id: string;
  employeeId: string; // Firestore document ID of the employee
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  serviceType: ServiceType;
  observation: string;
}

export type Role = 'admin' | 'user';

export interface User {
    uid: string;
    username: string;
    role: Role;
}