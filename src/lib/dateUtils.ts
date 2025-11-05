// Date utility functions for dd-mm-yyyy format

/**
 * Validates if a string is in dd-mm-yyyy format
 */
export function isValidDateFormat(dateString: string): boolean {
  const regex = /^\d{2}-\d{2}-\d{4}$/;
  if (!regex.test(dateString)) {
    return false;
  }

  const [day, month, year] = dateString.split('-').map(Number);
  
  // Check if date is valid
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

/**
 * Converts dd-mm-yyyy to yyyy-mm-dd (database format)
 */
export function convertToDBFormat(dateString: string): string {
  const [day, month, year] = dateString.split('-');
  return `${year}-${month}-${day}`;
}

/**
 * Converts yyyy-mm-dd (database format) to dd-mm-yyyy
 */
export function convertFromDBFormat(dateString: string): string {
  if (!dateString) return '';
  
  // Handle both full timestamp and date-only formats
  const dateOnly = dateString.split('T')[0];
  const [year, month, day] = dateOnly.split('-');
  return `${day}-${month}-${year}`;
}

