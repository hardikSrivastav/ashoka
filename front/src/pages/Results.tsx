import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Footer from "@/components/Footer";

export default function ResultsPage() {
  const location = useLocation() as any;
  const navigate = useNavigate();
  const payload = location.state?.responseText as string | undefined;

  if (!payload) {
    return (
      <div className="min-h-screen bg-background p-6 font-mono">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="text-2xl font-semibold">No results</div>
          <button className="underline" onClick={() => navigate(-1)}>Go back</button>
        </div>
      </div>
    );
  }

  let parsed: any = null;
  try { parsed = JSON.parse(payload); } catch {}

  // Combine all course arrays into a single array for display
  const allCourses: any[] = [];
  if (parsed) {
    if (Array.isArray(parsed.rankedCourses)) {
      allCourses.push(...parsed.rankedCourses);
    } else {
      // Handle legacy format with preferredCourses and notPreferredCourses
      if (Array.isArray(parsed.preferredCourses)) {
        allCourses.push(...parsed.preferredCourses);
      }
      if (Array.isArray(parsed.notPreferredCourses)) {
        allCourses.push(...parsed.notPreferredCourses);
      }
    }
  }

  if (!parsed || allCourses.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6 font-mono">
        <div className="max-w-7xl mx-auto space-y-4">
          <Card className="p-3">
            <pre className="text-xs whitespace-pre-wrap break-words">{payload}</pre>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 font-mono flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-1">
        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-semibold">Your Ideal FC Ranking</div>
          <div className="text-sm space-x-4">
            <a className="underline" href="/">Home</a>
            <a className="underline" href="/courses">Courses</a>
            <a className="underline" href="/faculty">Faculty</a>
          </div>
        </div>
        <div className="overflow-auto border rounded">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Code</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Reasoning</TableHead>
                <TableHead>Preferred</TableHead>
                <TableHead>Neutral</TableHead>
                <TableHead>Not Preferred</TableHead>
                <TableHead>Alternates</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allCourses.map((c: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell className="font-mono">{c.code}</TableCell>
                    <TableCell>{c.title}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-xl whitespace-pre-wrap">{c.reasoning || ''}</TableCell>
                    <TableCell className="text-xs">
                      {Array.isArray(c.recommendedSections?.preferred) ? (
                        <div className="space-y-1">
                          {c.recommendedSections.preferred.map((p: any, i: number) => (
                            <div key={i}>{typeof p === 'string' ? p : p.lsCode}</div>
                          ))}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-xs">
                      {Array.isArray(c.recommendedSections?.neutral) ? (
                        <div className="space-y-1">
                          {c.recommendedSections.neutral.map((p: any, i: number) => (
                            <div key={i}>{typeof p === 'string' ? p : p.lsCode}</div>
                          ))}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-xs">
                      {Array.isArray(c.recommendedSections?.notPreferred) ? (
                        <div className="space-y-1">
                          {c.recommendedSections.notPreferred.map((p: any, i: number) => (
                            <div key={i}>{typeof p === 'string' ? p : p.lsCode}</div>
                          ))}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-xs">
                      {Array.isArray(c.recommendedSections?.alternates) ? (
                        <div className="space-y-1">
                          {c.recommendedSections.alternates.map((p: any, i: number) => (
                            <div key={i}>{typeof p === 'string' ? p : p.lsCode}</div>
                          ))}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-xs">
                      <Dialog>
                        <DialogTrigger asChild>
                          <button className="underline underline-offset-2">Details</button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle className="font-mono">{c.code} — {c.title}</DialogTitle>
                            <DialogDescription>
                            <div className="space-y-4 not-italic">
                              <div>
                                <div className="text-xs uppercase tracking-wide text-foreground/70 mb-1">Reasoning</div>
                                <div className="text-sm whitespace-pre-wrap">{c.reasoning || '—'}</div>
                              </div>
                              <div className="space-y-2">
                                <div className="text-xs uppercase tracking-wide text-foreground/70">Preferred</div>
                                <div className="border rounded">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="w-[110px]">lsCode</TableHead>
                                        <TableHead>Why</TableHead>
                                        <TableHead className="w-[260px]">Evidence</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {(c.recommendedSections?.preferred || []).map((p: any, i: number) => {
                                        const ls = typeof p === 'string' ? p : p.lsCode;
                                        const why = typeof p === 'string' ? '' : (p.why || '');
                                        const ev = typeof p === 'string' ? null : (p.evidence || null);
                                        return (
                                          <TableRow key={i}>
                                            <TableCell className="font-mono text-xs">{ls}</TableCell>
                                            <TableCell className="text-xs whitespace-pre-wrap">{why}</TableCell>
                                            <TableCell className="text-xs">
                                              {ev ? (
                                                <div className="space-y-1">
                                                  {typeof ev.rating_overall !== 'undefined' && <div>rating: {ev.rating_overall} {ev.total_reviews ? `(${ev.total_reviews})` : ''}</div>}
                                                  {ev.grading_type && <div>grading: {ev.grading_type}</div>}
                                                  {ev.class_mode && <div>mode: {ev.class_mode}</div>}
                                                  {typeof ev.extra_credit !== 'undefined' && <div>extra: {String(ev.extra_credit)}</div>}
                                                  {Array.isArray(ev.faculty_names_or_titles) && ev.faculty_names_or_titles.length > 0 && (
                                                    <div>faculty: {ev.faculty_names_or_titles.join(', ')}</div>
                                                  )}
                                                </div>
                                              ) : '—'}
                                            </TableCell>
                                          </TableRow>
                                        );
                                      })}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="text-xs uppercase tracking-wide text-foreground/70">Alternates</div>
                                <div className="border rounded">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="w-[110px]">lsCode</TableHead>
                                        <TableHead>Why</TableHead>
                                        <TableHead className="w-[260px]">Evidence</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {(c.recommendedSections?.alternates || []).map((p: any, i: number) => {
                                        const ls = typeof p === 'string' ? p : p.lsCode;
                                        const why = typeof p === 'string' ? '' : (p.why || '');
                                        const ev = typeof p === 'string' ? null : (p.evidence || null);
                                        return (
                                          <TableRow key={i}>
                                            <TableCell className="font-mono text-xs">{ls}</TableCell>
                                            <TableCell className="text-xs whitespace-pre-wrap">{why}</TableCell>
                                            <TableCell className="text-xs">
                                              {ev ? (
                                                <div className="space-y-1">
                                                  {typeof ev.rating_overall !== 'undefined' && <div>rating: {ev.rating_overall} {ev.total_reviews ? `(${ev.total_reviews})` : ''}</div>}
                                                  {ev.grading_type && <div>grading: {ev.grading_type}</div>}
                                                  {ev.class_mode && <div>mode: {ev.class_mode}</div>}
                                                  {typeof ev.extra_credit !== 'undefined' && <div>extra: {String(ev.extra_credit)}</div>}
                                                  {Array.isArray(ev.faculty_names_or_titles) && ev.faculty_names_or_titles.length > 0 && (
                                                    <div>faculty: {ev.faculty_names_or_titles.join(', ')}</div>
                                                  )}
                                                </div>
                                              ) : '—'}
                                            </TableCell>
                                          </TableRow>
                                        );
                                      })}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            </div>
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <Footer />
    </div>
  );
}
