

import type { ServiceType } from '../types';

export const calculateHoursWorked = (startTime: string, endTime: string): number => {
  if (!startTime || !endTime) return 0;
  
  // Ensure HH:MM:SS format for Date parsing consistency
  const formatTime = (time: string) => (time.length === 5 ? `${time}:00` : time);

  const start = new Date(`2000-01-01T${formatTime(startTime)}`);
  const end = new Date(`2000-01-01T${formatTime(endTime)}`);

  if (end <= start) {
    // Assumes overnight is not a valid case for this app's logic
    return 0;
  }
  
  const diffMs = end.getTime() - start.getTime();
  return diffMs / (1000 * 60 * 60);
};

export const calculateOvertimeValue = (baseSalary: number, hours: number, serviceType: ServiceType): number => {
  if (baseSalary <= 0 || hours <= 0) return 0;

  const hourlyRate = baseSalary / 220; // Standard Brazilian CLT divisor
  const multiplier = serviceType === '60%' ? 1.6 : 2.0;

  return hourlyRate * multiplier * hours;
};