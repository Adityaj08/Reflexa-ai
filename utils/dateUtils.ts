import { format, startOfWeek, endOfWeek, parseISO, isWithinInterval } from 'date-fns';

export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM dd, yyyy');
};

export const formatTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'h:mm a');
};

export const formatDayOfWeek = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'EEE').toUpperCase();
};

export const formatDayOfMonth = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'dd');
};

export const formatMonth = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMMM yyyy');
};

export const formatMonthShort = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM yyyy');
};

export const getWeekRange = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const start = startOfWeek(dateObj, { weekStartsOn: 1 });
  const end = endOfWeek(dateObj, { weekStartsOn: 1 });
  return { start, end };
};

export const isInCurrentWeek = (date: Date | string, currentDate: Date = new Date()) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const { start, end } = getWeekRange(currentDate);
  return isWithinInterval(dateObj, { start, end });
};

export const getMonthKey = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'yyyy-MM');
};