import { GraduationCap } from 'lucide-react';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex items-center">
          <GraduationCap className="h-6 w-6 mr-2 text-primary" />
          <span className="font-bold text-lg">College Compass</span>
        </div>
      </div>
    </header>
  );
}
