import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, MapPin, MessageSquare } from "lucide-react"

const activities = [
  {
    id: "1",
    type: "job_completed",
    message: "John Smith completed HVAC maintenance at ABC Corp",
    time: "5 minutes ago",
    icon: CheckCircle,
    iconColor: "text-green-600",
  },
  {
    id: "2",
    type: "job_started",
    message: "Sarah Johnson started electrical inspection",
    time: "12 minutes ago",
    icon: Clock,
    iconColor: "text-primary",
  },
  {
    id: "3",
    type: "location_update",
    message: "Mike Wilson arrived at City Hospital",
    time: "18 minutes ago",
    icon: MapPin,
    iconColor: "text-secondary",
  },
  {
    id: "4",
    type: "customer_note",
    message: "New note added to XYZ Manufacturing job",
    time: "25 minutes ago",
    icon: MessageSquare,
    iconColor: "text-muted-foreground",
  },
  {
    id: "5",
    type: "job_completed",
    message: "Lisa Chen completed plumbing repair",
    time: "1 hour ago",
    icon: CheckCircle,
    iconColor: "text-green-600",
  },
]

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-balance">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon
          return (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={`p-2 rounded-full bg-muted ${activity.iconColor}`}>
                <Icon className="h-3 w-3" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm text-pretty">{activity.message}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
