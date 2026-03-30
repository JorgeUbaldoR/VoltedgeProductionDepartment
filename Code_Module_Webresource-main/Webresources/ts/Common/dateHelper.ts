namespace DateHelper {
  /**
   * Formats a given UTC date string into a localized date and time string.
   *
   * @param utcDateString - The UTC date string to be formatted.
   * @returns A string representing the date and time in the local time zone.
   *
   * @example
   * const utcDateString = '2023-10-15T15:30:00.000Z';
   * const formattedDate = formatUtcDate(utcDateString);
   * // Output: '15/10/2023, 15:30'
   */
  export function formatUtcDate(utcDateString: string): string {
    // Parse the UTC date string into a Date object
    const date = new Date(utcDateString);

    // Extract date and time components in UTC
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const day = date.getUTCDate().toString().padStart(2, '0');
    const hour = date.getUTCHours().toString().padStart(2, '0');
    const minute = date.getUTCMinutes().toString().padStart(2, '0');

    // Assemble the formatted date and time string
     return `${day}/${month}/${year}, ${hour}:${minute}`;
  }
}
