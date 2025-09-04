import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MapPin, Plus, Users, Wrench } from "lucide-react"

const actions = [
  {
    title: "New Job",
    description: "Create a new service job",
    icon: Plus,
    variant: "default" as const,
  },
  {
    title: "Schedule",
    description: "View job calendar",
    icon: Calendar,
    variant: "outline" as const,
  },
  {
    title: "Customers",
    description: "Manage customers",
    icon: Users,
    variant: "outline" as const,
  },
  {
    title: "Equipment",
    description: "Track equipment",
    icon: Wrench,
    variant: "outline" as const,
  },
  {
    title: "Field Map",
    description: "View technician locations",
    icon: MapPin,
    variant: "outline" as const,
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-balance">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <Button key={action.title} variant={action.variant} className="h-auto flex-col gap-2 p-4">
                <Icon className="h-5 w-5" />
                <div className="text-center">
                  <div className="font-medium text-sm text-balance">{action.title}</div>
                  <div className="text-xs text-muted-foreground text-pretty">{action.description}</div>
                </div>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
