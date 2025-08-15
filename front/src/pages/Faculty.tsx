import { useMemo } from "react";
import { Card } from "@/components/ui/card";
// @ts-ignore
import facultyCsv from '../../../good csvs/ashoka_faculty_profiles.csv?raw';
// @ts-ignore
import scheduleCsv from '../../../good csvs/ashoka-course-schedule.csv?raw';
import Footer from '@/components/Footer';

function parseCsv(text: string): string[][] {
  return text
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map((s) => s.replace(/^"|"$/g, '')));
}

export default function FacultyPage() {
  const rows = useMemo(() => parseCsv(String(facultyCsv)), []);
  const header = rows[0] || [];
  const body = rows.slice(1);

  // Build email -> set of course codes from schedule
  const scheduleRows = useMemo(() => parseCsv(String(scheduleCsv)), []);
  const sHeader = scheduleRows[0] || [];
  const sh = (k: string) => sHeader.indexOf(k);
  const sCode = sh('Code');
  const sEmails = sh('Faculty Emails');
  const emailToCodes: Record<string, Set<string>> = {};
  for (const r of scheduleRows.slice(1)) {
    const code = (r[sCode] || '').trim().toUpperCase();
    const emails = (r[sEmails] || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
    for (const e of emails) {
      if (!emailToCodes[e]) emailToCodes[e] = new Set();
      if (code) emailToCodes[e].add(code);
    }
  }

  // Columns to show: name, email, courses, education, profile_url
  const keep = [
    'target_name', 'email', 'courses', 'education', 'profile_url'
  ];
  const indices = keep.map(k => header.indexOf(k));

  return (
    <div className="min-h-screen bg-background p-6 font-mono">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="text-2xl font-semibold">Faculty Directory</div>
        <Card className="w-full overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-table-header border-b border-table-border">
                  {keep.map((k, i) => (
                    <th key={i} className="px-4 py-3 text-left font-semibold text-foreground">
                      {k}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {body.map((r, idx) => (
                  <tr key={idx} className={`border-b border-table-border ${idx % 2 === 0 ? 'bg-table-row-even' : 'bg-table-row-odd'}`}>
                    {indices.map((ci, j) => (
                      <td key={j} className="px-4 py-3">
                        {(() => {
                          if (keep[j] === 'courses') {
                            const email = (r[header.indexOf('email')] || '').toLowerCase();
                            const codes = Array.from(emailToCodes[email] ?? []);
                            return <span className="text-foreground">{codes.join(', ')}</span>;
                          }
                          const val = ci >= 0 ? (r[ci] || '') : '';
                          if (keep[j] === 'profile_url' && val) {
                            return <a className="underline" href={val} target="_blank" rel="noreferrer">{val}</a>;
                          }
                          if (keep[j] === 'email' && val) {
                            return <a className="underline" href={`mailto:${val}`}>{val}</a>;
                          }
                          return <span className="text-foreground">{val}</span>;
                        })()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <div>
          <a href="/" className="underline">Back</a>
        </div>
        <Footer />
      </div>
    </div>
  );
}
