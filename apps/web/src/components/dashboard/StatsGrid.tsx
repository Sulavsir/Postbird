import { Inbox, MousePointerClick, Send } from "lucide-react";
import type { DashboardData } from "../../features/dashboard/dashboard.service";
import { Card, CardContent } from "@/components/ui/card";

export function StatsGrid({ stats }: { stats: DashboardData["stats"] }) {
  const openRate = Math.round(stats.openRate * 1000) / 10;
  const deliveryRate = Math.round(stats.deliveryRate * 1000) / 10;
  return (
    <section className="grid gap-4 md:grid-cols-3" id="overview">
      <Card>
        <CardContent className="p-5">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            Sent this month <Send size={16} />
          </div>
          <p className="font-heading text-2xl font-extrabold">
            {stats.sentThisMonth.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {stats.totalSent.toLocaleString()} total sent
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-5">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            Open rate <Inbox size={16} />
          </div>
          <p className="font-heading text-2xl font-extrabold">{openRate}%</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {stats.opened.toLocaleString()} emails with at least one recorded
            pixel hit. 0% is expected until a client loads the tracking image
            (localhost pixels cannot be fetched by Gmail).
          </p>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-emerald-400"
              style={{ width: `${openRate}%` }}
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-5">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            Delivery rate <MousePointerClick size={16} />
          </div>
          <p className="font-heading text-2xl font-extrabold">{deliveryRate}%</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {stats.clicked.toLocaleString()} recorded link clicks
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
