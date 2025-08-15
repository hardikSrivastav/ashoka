import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
// @ts-ignore
import oneLinersRaw from '../../one-liners?raw';
import Footer from "@/components/Footer";

interface FormData {
  intendedMajor: string;
  optimizeFor: string;
  workloadTolerance: string;
  assessmentPreference: string[];
  teachingQualityImportance: string;
  gradingType: string;
  classMode: string;
  extraCredit: string;
  facultyPedigree: string;
}

const CourseRecommendation = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const oneLiners = useMemo(() => String(oneLinersRaw).split(/\r?\n/).map(s => s.trim()).filter(Boolean), []);
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    if (!loading || oneLiners.length === 0) return;
    const id = setInterval(() => {
      setLineIndex((i) => (i + 1) % oneLiners.length);
    }, 3500);
    return () => clearInterval(id);
  }, [loading, oneLiners.length]);

  const navigate = useNavigate();
  const { register, handleSubmit, watch, setValue, getValues } = useForm<FormData>({
    defaultValues: {
      intendedMajor: "",
      optimizeFor: "",
      workloadTolerance: "",
      assessmentPreference: [],
      teachingQualityImportance: "",
      gradingType: "",
      classMode: "",
      extraCredit: "",
      facultyPedigree: ""
    }
  });

  const steps = [
    { title: "Academic Goals", fields: ["intendedMajor", "optimizeFor"] },
    { title: "Learning Preferences", fields: ["workloadTolerance", "assessmentPreference", "teachingQualityImportance"] },
    { title: "Course Format", fields: ["gradingType", "classMode", "extraCredit", "facultyPedigree"] }
  ];

  const assessmentOptions = [
    { id: "projects", label: "Projects" },
    { id: "exams", label: "Exams" },
    { id: "assignments", label: "Assignments" },
    { id: "discussion", label: "Discussion" },
    { id: "labs", label: "Labs" },
    { id: "reading", label: "Reading" }
  ];

  const handleAssessmentChange = (optionId: string, checked: boolean) => {
    const current = getValues("assessmentPreference") || [];
    if (checked) setValue("assessmentPreference", [...current, optionId]);
    else setValue("assessmentPreference", current.filter(id => id !== optionId));
  };

  function toBackendOptimize(v: string) {
    if (!v) return "balance";
    if (v === 'gpa') return 'GPA';
    if (v === 'learning') return 'learning depth';
    if (v === 'balance') return 'balance';
    return v;
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");
    setResponse("");
    try {
      const formAnswers = {
        intended_major: data.intendedMajor,
        optimize_for: toBackendOptimize(data.optimizeFor),
        workload_tolerance: data.workloadTolerance || 'medium',
        assessment_preference: data.assessmentPreference || [],
        teaching_quality_importance: data.teachingQualityImportance || 'medium',
        grading_type_preference: data.gradingType || 'no preference',
        class_mode_preference: data.classMode || 'no preference',
        extra_credit_preference: (data.extraCredit === 'neutral' ? 'no preference' : data.extraCredit) || 'no preference',
        faculty_importance: data.facultyPedigree || 'medium',
        need_detailed_explanations: true,
      };
      const body: any = {
        mode: 'ai',
        formAnswers,
        options: { numPreferredSections: 5, detailedExplanations: true }
      };
      const res = await fetch('/api/recommendations', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
      });
      const text = await res.text();
      setResponse(text);
      if (!res.ok) setError(`HTTP ${res.status}`);
      else navigate('/results', { state: { responseText: text } });
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => { if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1); };
  const prevStep = () => { if (currentStep > 0) setCurrentStep(currentStep - 1); };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-8">
            <div className="space-y-2">
              <Label htmlFor="intendedMajor" className="text-lg font-medium">Intended major</Label>
              <Input placeholder="EcoFin lmao" className="h-12" {...register("intendedMajor")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="optimizeFor" className="text-lg font-medium">Optimize for</Label>
              <Select onValueChange={(value) => setValue("optimizeFor", value)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Choose default" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpa">GPA</SelectItem>
                  <SelectItem value="learning">Learning</SelectItem>
                  <SelectItem value="networking">Networking</SelectItem>
                  <SelectItem value="skills">Skills</SelectItem>
                  <SelectItem value="balance">Balance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-8">
            <div className="space-y-2">
              <Label htmlFor="workloadTolerance" className="text-lg font-medium">Workload tolerance</Label>
              <Select onValueChange={(value) => setValue("workloadTolerance", value)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Choose default" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4">
              <Label className="text-lg font-medium">Assessment preference</Label>
              <div className="grid grid-cols-2 gap-4">
                {assessmentOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-3">
                    <Checkbox id={option.id} onCheckedChange={(checked) => handleAssessmentChange(option.id, checked as boolean)} />
                    <Label htmlFor={option.id} className="font-medium">{option.label}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="teachingQualityImportance" className="text-lg font-medium">Teaching quality importance</Label>
              <Select onValueChange={(value) => setValue("teachingQualityImportance", value)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Choose default" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="gradingType" className="text-lg font-medium">Grading type</Label>
                <Select onValueChange={(value) => setValue("gradingType", value)}>
                  <SelectTrigger className="h-12"><SelectValue placeholder="Choose default" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="absolute">Absolute</SelectItem>
                    <SelectItem value="relative">Relative</SelectItem>
                    <SelectItem value="no preference">No preference</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="classMode" className="text-lg font-medium">Class mode</Label>
                <Select onValueChange={(value) => setValue("classMode", value)}>
                  <SelectTrigger className="h-12"><SelectValue placeholder="Choose default" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="offline">Offline</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="no preference">No preference</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="extraCredit" className="text-lg font-medium">Extra credit</Label>
                <Select onValueChange={(value) => setValue("extraCredit", value)}>
                  <SelectTrigger className="h-12"><SelectValue placeholder="Choose default" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prefer">Prefer</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="avoid">Avoid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="facultyPedigree" className="text-lg font-medium">Faculty pedigree</Label>
                <Select onValueChange={(value) => setValue("facultyPedigree", value)}>
                  <SelectTrigger className="h-12"><SelectValue placeholder="Choose default" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-3xl font-bold mb-4">The best FCs for you. Lock in.</div>
        <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{steps[currentStep].title}</CardTitle>
          <div className="flex justify-center mt-4">
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div key={index} className={`h-2 w-8 rounded-full transition-colors ${index <= currentStep ? "bg-primary" : "bg-muted"}`} />
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={(e) => e.preventDefault()}>
            {renderCurrentStep()}
            <div className="flex justify-between pt-6">
              <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 0} className="flex items-center space-x-2">
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>
              {currentStep === steps.length - 1 ? (
                <Button type="button" onClick={() => void handleSubmit(onSubmit)()} className="flex items-center space-x-2" disabled={loading}>
                  <span>{loading ? 'Submitting…' : 'Get Recommendations'}</span>
                </Button>
              ) : (
                <Button type="button" onClick={nextStep} className="flex items-center space-x-2">
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </form>

          {loading && (
            <>
              <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/20" />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md text-sm text-foreground border rounded p-4 bg-background shadow-lg">
                  <div className="font-medium mb-2">Cooking your ranking, here's some ragebait…</div>
                  <div className="italic">{oneLiners[lineIndex] || '…'}</div>
                  <div className="mt-3 h-1 w-full bg-muted rounded">
                    <div className="h-1 bg-primary rounded animate-pulse" style={{ width: '66%' }} />
                  </div>
                </div>
              </div>
            </>
          )}

          {(error || response) && (
            <div className="space-y-2">
              {error && <div className="text-red-500 text-xs">{error}</div>}
              {response && (() => {
                let parsed: any = null;
                try { parsed = JSON.parse(response); } catch {}
                if (!parsed || !Array.isArray(parsed.rankedCourses)) {
                  return <pre className="text-xs whitespace-pre-wrap break-words max-h-80 overflow-auto border rounded p-2 bg-muted/30">{response}</pre>;
                }
                return (
                  <div className="overflow-auto border rounded">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[120px]">Code</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Reasoning</TableHead>
                          <TableHead>Preferred Sections</TableHead>
                          <TableHead>Alternates</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {parsed.rankedCourses.map((c: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell className="font-mono">{c.code}</TableCell>
                            <TableCell>{c.title}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{c.reasoning || ''}</TableCell>
                            <TableCell className="text-xs">
                              {Array.isArray(c.recommendedSections?.preferred) ? (
                                <div className="space-y-1">
                                  {c.recommendedSections.preferred.map((p: any, i: number) => (
                                    <div key={i}>
                                      {typeof p === 'string' ? p : p.lsCode}
                                    </div>
                                  ))}
                                </div>
                              ) : null}
                            </TableCell>
                            <TableCell className="text-xs">
                              {Array.isArray(c.recommendedSections?.alternates) ? (
                                <div className="space-y-1">
                                  {c.recommendedSections.alternates.map((p: any, i: number) => (
                                    <div key={i}>
                                      {typeof p === 'string' ? p : p.lsCode}
                                    </div>
                                  ))}
                                </div>
                              ) : null}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                );
              })()}
            </div>
          )}
        </CardContent>
        </Card>
        <Footer />
      </div>
    </div>
  );
};

export default CourseRecommendation;
