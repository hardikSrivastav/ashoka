// @ts-ignore
import disclaimer from '../../Disclaimer.txt?raw';

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-background p-6 font-mono flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex-1">
        <div className="text-2xl font-semibold mb-4">Disclaimer</div>
        <pre className="whitespace-pre-wrap text-sm bg-muted/30 p-4 rounded border">{String(disclaimer)}</pre>
      </div>
      <div className="mt-6 text-center text-xs text-muted-foreground">
        <a className="underline" href="https://www.hardiksrivastava.com" target="_blank" rel="noreferrer">hardik srivastava</a> · °
      </div>
    </div>
  );
}
