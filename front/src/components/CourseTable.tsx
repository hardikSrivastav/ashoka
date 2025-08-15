import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getCatalogue, getRatings } from "@/lib/catalog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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

interface CourseTableProps {
  data: CourseData[];
}

export const CourseTable = ({ data }: CourseTableProps) => {
  const extractFacultyNames = (faculty: string) => {
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

  const formatFaculty = (faculty: string) => {
    const emails = faculty.split(', ');
    return emails.map((email, index) => (
      <span key={index} className="block text-xs text-muted-foreground">
        {email.trim()}
      </span>
    ));
  };

  return (
    <Card className="w-full overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full font-mono text-sm">
          <thead>
            <tr className="bg-table-header border-b border-table-border">
              <th className="px-4 py-3 text-left font-semibold text-foreground">LSNo</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Code</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Title</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">
                <a href="/faculty" className="underline">Faculty Names</a>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Faculty Emails</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((course, index) => (
              <tr
                key={`${course.ScheduleSysGenId}-${course.LSNo}`}
                className={`
                  border-b border-table-border transition-colors hover:bg-muted/50
                  ${index % 2 === 0 ? 'bg-table-row-even' : 'bg-table-row-odd'}
                `}
              >
                <td className="px-4 py-3 text-primary font-medium">
                  {course.LSNo}
                </td>
                <td className="px-4 py-3">
                  <code className="bg-muted px-2 py-1 rounded text-accent">
                    {course.Code}
                  </code>
                </td>
                <td className="px-4 py-3 max-w-xs">
                  <div className="text-foreground font-medium">
                    {course.Title || getCatalogue(course.LSCode)?.title || ''}
                  </div>
                  {(() => {
                    const cat = getCatalogue(course.LSCode);
                    const rat = getRatings(course.LSCode);
                    return (cat?.description || cat?.requirements || rat) ? (
                      <div className="mt-1 space-y-1">
                        {cat?.description && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className="text-xs text-muted-foreground underline underline-offset-2">
                                Details
                              </button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle className="font-mono">{course.Title || cat?.title || course.LSCode}</DialogTitle>
                                <DialogDescription>
                                  <div className="space-y-3 not-italic">
                                    <div className="text-sm whitespace-pre-wrap">{cat.description}</div>
                                    {cat.requirements && (
                                      <div>
                                        <div className="text-xs uppercase tracking-wide text-foreground/70">Requirements</div>
                                        <div className="text-sm whitespace-pre-wrap">{cat.requirements}</div>
                                      </div>
                                    )}
                                  </div>
                                </DialogDescription>
                              </DialogHeader>
                            </DialogContent>
                          </Dialog>
                        )}
                        <div className="flex flex-wrap gap-1">
                          {rat?.overallRating !== undefined && (
                            <Badge variant="secondary" className="text-[10px]">
                              Rating: {rat.overallRating?.toFixed(1)}{rat.totalReviews ? ` (${rat.totalReviews})` : ''}
                            </Badge>
                          )}
                          {rat?.gradingType && (
                            <Badge variant="outline" className="text-[10px]">
                              {rat.gradingType}
                            </Badge>
                          )}
                          {rat?.classMode && (
                            <Badge variant="outline" className="text-[10px]">
                              {rat.classMode}
                            </Badge>
                          )}
                          {typeof rat?.extraCredit !== 'undefined' && rat?.extraCredit !== '' && (
                            <Badge variant="outline" className="text-[10px]">
                              Extra: {String(rat.extraCredit)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ) : null;
                  })()}
                </td>
                <td className="px-4 py-3 max-w-md">
                  <div className="text-foreground text-sm">
                    {extractFacultyNames(course.Faculty)}
                  </div>
                </td>
                <td className="px-4 py-3 max-w-md">
                  <div className="space-y-1">
                    {formatFaculty(course.Faculty)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge 
                    variant={course.isCatalogueExist === 1 ? "default" : "secondary"}
                    className={`
                      font-mono text-xs
                      ${course.isCatalogueExist === 1 
                        ? 'bg-status-active text-status-active-foreground' 
                        : 'bg-status-inactive text-status-inactive-foreground'
                      }
                    `}
                  >
                    {course.isCatalogueExist === 1 ? 'ACTIVE' : 'INACTIVE'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};