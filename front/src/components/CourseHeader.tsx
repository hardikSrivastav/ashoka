import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

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

interface CourseHeaderProps {
  totalCourses: number;
  activeCourses: number;
  inactiveCourses: number;
  data: CourseData[];
  onDownloadCSV: () => void;
}

export const CourseHeader = ({ totalCourses, activeCourses, inactiveCourses, data, onDownloadCSV }: CourseHeaderProps) => {
  return (
    <div className="space-y-4 mb-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground font-mono">
          Course Schedule Data
        </h1>
        <p className="text-muted-foreground font-mono text-lg">
          Tabular view of course offerings and faculty assignments
        </p>
      </div>
      
      
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-muted-foreground">Total:</span>
            <Badge variant="outline" className="font-mono">
              {totalCourses}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-muted-foreground">Active:</span>
            <Badge className="bg-status-active text-status-active-foreground font-mono">
              {activeCourses}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-muted-foreground">Inactive:</span>
            <Badge className="bg-status-inactive text-status-inactive-foreground font-mono">
              {inactiveCourses}
            </Badge>
          </div>
        </div>
        
        <Button 
          onClick={onDownloadCSV}
          variant="outline" 
          size="sm"
          className="font-mono"
        >
          <Download className="w-4 h-4 mr-2" />
          Download CSV
        </Button>
      </div>
    </div>
  );
};