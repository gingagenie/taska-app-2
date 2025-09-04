"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, MoreHorizontal, Search } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { useEffect, useState } from "react"

interface Job {
  id: string
  title: string
  description: string | null
  status: string
  scheduled_date: string | null
  scheduled_time: string | null
  customer_id: string | null
  customers: {
    name: string
  } | null
}

export function JobsView() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    const fetchJobs = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from("jobs")
          .select(`
            id,
            title,
            description,
            status,
            scheduled_date,
            scheduled_time,
            customer_id,
            customers (
              name
            )
          `)
          .order("scheduled_date", { ascending: true })

        if (error) {
          console.error("Error fetching jobs:", error)
        } else {
          setJobs(data || [])
        }
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [user, supabase])

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "pending":
        return "bg-orange-100 text-orange-800"
      case "completed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredJobs = jobs.filter(
    (job) =>
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customers?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <div className="text-gray-500">Loading jobs...</div>
      </div>
    )
  }

  return (
    <div className="h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Jobs</h1>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              All Status
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search title, customer, ID..."
                className="pl-10 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">New Job</Button>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="p-6 space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {searchTerm ? "No jobs found matching your search." : "No jobs found."}
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div key={job.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{job.title}</h3>
                    <Badge className={getStatusStyle(job.status)}>{job.status?.replace("_", " ")}</Badge>
                  </div>

                  {job.description && <p className="text-gray-600 mb-4">{job.description}</p>}

                  <div className="grid grid-cols-3 gap-8 text-sm">
                    <div>
                      <span className="text-gray-500">Customer</span>
                      <p className="font-medium text-gray-900">{job.customers?.name || "No customer assigned"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Scheduled</span>
                      <p className="font-medium text-gray-900">
                        {job.scheduled_date ? new Date(job.scheduled_date).toLocaleDateString() : "Not scheduled"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Time</span>
                      <p className="font-medium text-gray-900">{job.scheduled_time || "Not set"}</p>
                    </div>
                  </div>
                </div>

                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
