import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, CheckCircle2, Clock } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 bg-gradient-to-r from-primary/5 via-primary/80 to-primary/5 text-foreground w-full min-h-full">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-18 bg-gradient-to-b from-background to-muted">
        <div className="max-w-3xl space-y-8">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
            Streamline your team's <span className="text-transparent bg-clip-text bg-gradient-to-r from-chart-4 to-chart-2">weekly reporting.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A centralized dashboard for teams to submit, review, and track weekly progress. No more scattered emails or messy spreadsheets.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/auth/signin">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 h-14 rounded-full shadow-lg shadow-primary/20 w-full sm:w-auto">
                Sign In <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Preview */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mt-24 text-left">
          <div className="p-6 bg-card rounded-2xl shadow-sm border border-border hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
              <CheckCircle2 />
            </div>
            <h3 className="text-xl font-bold mb-2 text-card-foreground">Standardized Reports</h3>
            <p className="text-muted-foreground">Ensure everyone reports the same metrics. Track tasks, blockers, and achievements uniformly.</p>
          </div>
          <div className="p-6 bg-card rounded-2xl shadow-sm border border-border hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-chart-2/10 text-chart-2 rounded-xl flex items-center justify-center mb-4">
              <Clock />
            </div>
            <h3 className="text-xl font-bold mb-2 text-card-foreground">Review Workflow</h3>
            <p className="text-muted-foreground">Managers can easily review, approve, or request corrections on reports in real-time.</p>
          </div>
          <div className="p-6 bg-card rounded-2xl shadow-sm border border-border hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-chart-1/10 text-chart-1 rounded-xl flex items-center justify-center mb-4">
              <BarChart3 />
            </div>
            <h3 className="text-xl font-bold mb-2 text-card-foreground">Team Dashboard</h3>
            <p className="text-muted-foreground">Get a bird's-eye view of your entire team's workload and project progress in one glance.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-muted-foreground text-sm border-t">
        © {new Date().getFullYear()} TeamSync. Weekly Report Generator.
      </footer>
    </div>
  );
}
