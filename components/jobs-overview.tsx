import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, MapPin, MoreHorizontal, User } from "lucide-react"

// Mock data representing jobs from your database schema
const jobs = [
  {
    id: "1",
    title: "HVAC Maintenance - Office Building",
    customer: "ABC Corp",
    address: "123 Business St, Sydney NSW",
    technician: "John Smith",
    status: "in_progress",
    priority: "high",
    scheduledFor: "2024-01-15T09:00:00Z",
    duration: 120,
  },
  {
    id: "2",
    title: "Electrical Inspection",
    customer: "XYZ Manufacturing",
    address: "456 Industrial Ave, Melbourne VIC",
    technician: "Sarah Johnson",
    status: "scheduled",
    priority: "normal",
    scheduledFor: "2024-01-15T14:00:00Z",
    duration: 90,
  },
  {
    id: "3",
    title: "Plumbing Repair - Emergency",
    customer: "City Hospital",
    address: "789 Health Blvd, Brisbane QLD",
    technician: "Mike Wilson",
    status: "urgent",
    priority: "urgent",
    scheduledFor: "2024-01-15T11:30:00Z",
    duration: 60,
  },
]

const statusColors = {
  scheduled: "bg-secondary text-secondary-foreground",
  in_progress: "bg-primary text-primary-foreground",
  urgent: "bg-destructive text-destructive-foreground",
  completed: "bg-green-100 text-green-800",
}

const priorityColors = {
  low: "bg-gray-100 text-gray-800",
  normal: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
}

export function JobsOverview() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-balance">Today's Jobs</CardTitle>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <h3 className="font-medium text-balance">{job.title}</h3>
                <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {job.customer}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span className="text-pretty">{job.address}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(job.scheduledFor).toLocaleTimeString("en-AU", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  ({job.duration}min)
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge className={statusColors[job.status as keyof typeof statusColors]}>
                  {job.status.replace("_", " ")}
                </Badge>
                <Badge variant="outline" className={priorityColors[job.priority as keyof typeof priorityColors]}>
                  {job.priority}
                </Badge>
                <span className="text-sm text-muted-foreground">Assigned to {job.technician}</span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 mt-2 md:mt-0">
              <Button variant="outline" size="sm">
                View Details
              </Button>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
