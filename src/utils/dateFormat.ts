/**
 * Format a date to DD.MM.YY format
 * @param date - Date object, string, or undefined
 * @returns Formatted date string in DD.MM.YY format
 */
export const formatDate = (date: Date | string | undefined): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) return '';
  
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = String(dateObj.getFullYear()).slice(-2);
  
  return `${day}.${month}.${year}`;
};

/**
 * Format a date to DD.MM.YYYY format (full year)
 * @param date - Date object, string, or undefined
 * @returns Formatted date string in DD.MM.YYYY format
 */
export const formatDateLong = (date: Date | string | undefined): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) return '';
  
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = String(dateObj.getFullYear());
  
  return `${day}.${month}.${year}`;
};

/**
 * Format a date with time to DD.MM.YY HH:MM format
 * @param date - Date object, string, or undefined
 * @returns Formatted date string with time
 */
export const formatDateTime = (date: Date | string | undefined): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) return '';
  
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = String(dateObj.getFullYear()).slice(-2);
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  
  return `${day}.${month}.${year} ${hours}:${minutes}`;
};

/**
 * Sort month names in chronological order (January -> December)
 * @param months - Array of month names
 * @returns Sorted array of month names
 */
export const sortMonthsChronologically = (months: string[]): string[] => {
  const monthOrder = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  return months.sort((a, b) => {
    const indexA = monthOrder.indexOf(a);
    const indexB = monthOrder.indexOf(b);
    return indexA - indexB;
  });
};
