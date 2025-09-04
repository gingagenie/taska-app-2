import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, CheckCircle, Clock, Users } from "lucide-react"

const stats = [
  {
    title: "Active Jobs",
    value: "24",
    change: "+12%",
    icon: Clock,
    color: "text-primary",
  },
  {
    title: "Completed Today",
    value: "8",
    change: "+5%",
    icon: CheckCircle,
    color: "text-green-600",
  },
  {
    title: "Scheduled",
    value: "16",
    change: "+8%",
    icon: Calendar,
    color: "text-secondary",
  },
  {
    title: "Active Technicians",
    value: "12",
    change: "0%",
    icon: Users,
    color: "text-muted-foreground",
  },
]

export function StatsCards() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-balance">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> from yesterday
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
