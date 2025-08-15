interface CourseData {
  ScheduleSysGenId: string;
  CourseSysGenId: string;
  LSNo: number;
  Category: string;
  Code: string;
  Title: string;
  LSCode: string;
  DisplayCode: string;
  Faculty: string;
  isCatalogueExist: number;
}

export const downloadCSV = (data: CourseData[], filename: string = 'course-data.csv') => {
  // Extract faculty names from emails
  const extractFacultyNames = (faculty: string): string => {
    const emails = faculty.split(', ');
    return emails.map(email => {
      const namePart = email.split('@')[0];
      // Convert email format (first.last_role) to readable name
      return namePart
        .split('_')[0] // Remove role suffixes like _tf, _ug25, etc.
        .split('.')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
    }).join(', ');
  };

  // Prepare CSV headers
  const headers = [
    'LSNo',
    'Code', 
    'Title',
    'Faculty Names',
    'Faculty Emails',
    'Status'
  ];

  // Prepare CSV rows
  const csvData = data.map(course => [
    course.LSNo,
    course.Code,
    course.Title,
    extractFacultyNames(course.Faculty),
    course.Faculty,
    course.isCatalogueExist === 1 ? 'ACTIVE' : 'INACTIVE'
  ]);

  // Combine headers and data
  const csvContent = [headers, ...csvData]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};