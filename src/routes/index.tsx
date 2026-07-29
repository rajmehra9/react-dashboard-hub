import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  LayoutDashboard,
  FolderKanban,
  CheckCircle2,
  Users,
  Search,
  Bell,
  Plus,
  MoreHorizontal,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from "lucide-react";

import { ClientOnly } from "@/components/client-only";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — ProjectDash" },
      { name: "description", content: "Overview of your projects, tasks, and team activity." },
      { property: "og:title", content: "Dashboard — ProjectDash" },
      { property: "og:description", content: "Overview of your projects, tasks, and team activity." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

const chartData = [
  { name: "Mon", tasks: 12 },
  { name: "Tue", tasks: 18 },
  { name: "Wed", tasks: 15 },
  { name: "Thu", tasks: 25 },
  { name: "Fri", tasks: 20 },
  { name: "Sat", tasks: 8 },
  { name: "Sun", tasks: 10 },
];

const projects = [
  {
    id: 1,
    name: "Website Redesign",
    status: "In progress",
    progress: 72,
    dueDate: "Aug 12",
    team: ["JD", "AL", "MK"],
  },
  {
    id: 2,
    name: "Mobile App MVP",
    status: "In review",
    progress: 45,
    dueDate: "Sep 01",
    team: ["SR", "TM"],
  },
  {
    id: 3,
    name: "API Migration",
    status: "On track",
    progress: 90,
    dueDate: "Aug 05",
    team: ["JD", "MK", "AL", "SR"],
  },
  {
    id: 4,
    name: "Marketing Campaign",
    status: "At risk",
    progress: 30,
    dueDate: "Aug 20",
    team: ["TM"],
  },
];

const recentTasks = [
  { id: 1, title: "Finalize homepage mockups", project: "Website Redesign", time: "2h ago" },
  { id: 2, title: "Review authentication flow", project: "Mobile App MVP", time: "4h ago" },
  { id: 3, title: "Deploy staging build", project: "API Migration", time: "6h ago" },
  { id: 4, title: "Update campaign copy", project: "Marketing Campaign", time: "8h ago" },
];

const stats = [
  {
    label: "Total Projects",
    value: "12",
    change: "+2",
    trend: "up",
    icon: FolderKanban,
  },
  {
    label: "Active Tasks",
    value: "48",
    change: "+8",
    trend: "up",
    icon: LayoutDashboard,
  },
  {
    label: "Completed",
    value: "124",
    change: "-3",
    trend: "down",
    icon: CheckCircle2,
  },
  {
    label: "Team Members",
    value: "9",
    change: "+1",
    trend: "up",
    icon: Users,
  },
];

function StatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    "In progress": "default",
    "On track": "secondary",
    "In review": "secondary",
    "At risk": "destructive",
  };

  return (
    <Badge variant={variantMap[status] ?? "outline"} className="capitalize">
      {status}
    </Badge>
  );
}

function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
              <LayoutDashboard className="h-5 w-5 text-primary" />
              <span>ProjectDash</span>
            </Link>
            <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
              <Link
                to="/"
                className="rounded-md bg-secondary px-3 py-2 text-foreground"
              >
                Dashboard
              </Link>
              <Link
                to="/projects"
                className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                Projects
              </Link>
              <Link
                to="/tasks"
                className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                Tasks
              </Link>
              <Link
                to="/team"
                className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                Team
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden w-64 sm:block">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search projects..."
                className="h-9 rounded-full pl-9"
              />
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
            </Button>
            <Avatar className="h-8 w-8 border">
              <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                JD
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Here's what's happening with your projects today.
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New project
          </Button>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="mt-1 flex items-center text-xs">
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="mr-1 h-3 w-3 text-success" />
                  ) : (
                    <ArrowDownRight className="mr-1 h-3 w-3 text-destructive" />
                  )}
                  <span className={stat.trend === "up" ? "text-success" : "text-destructive"}>
                    {stat.change}
                  </span>
                  <span className="ml-1 text-muted-foreground">from last week</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Task completion</CardTitle>
                <CardDescription>Tasks completed over the last 7 days</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                View report
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-[260px] w-full">
                <ClientOnly fallback={<div className="h-full w-full animate-pulse rounded-md bg-muted" />}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      />
                      <Tooltip
                        cursor={{ fill: "hsl(var(--muted))" }}
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius-md)",
                        }}
                        itemStyle={{ color: "hsl(var(--card-foreground))" }}
                      />
                      <Bar
                        dataKey="tasks"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={48}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ClientOnly>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>Latest updates from your team</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {recentTasks.map((task) => (
                  <li key={task.id} className="flex items-start gap-3">
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                      <Clock className="h-4 w-4 text-secondary-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {task.project} · {task.time}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Projects</CardTitle>
              <CardDescription>Active projects and their current status</CardDescription>
            </div>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Due date</TableHead>
                  <TableHead className="text-right">Team</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>
                      <StatusBadge status={project.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Progress value={project.progress} className="h-2 w-24" />
                        <span className="text-xs text-muted-foreground">{project.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {project.dueDate}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end -space-x-2">
                        {project.team.map((initials) => (
                          <Avatar
                            key={initials}
                            className="h-7 w-7 border-2 border-background"
                          >
                            <AvatarFallback className="bg-secondary text-xs text-secondary-foreground">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
