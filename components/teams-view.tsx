"use client"

import { Users } from "lucide-react"

const teamMembers = [
  {
    id: 1,
    name: "Mike Johnson",
    role: "Senior Technician",
    team: "Alpha Team",
    jobs: 4,
    initials: "MJ",
    color: "bg-blue-600",
  },
  {
    id: 2,
    name: "Sarah Wilson",
    role: "Electrician",
    team: "Alpha Team",
    jobs: 3,
    initials: "SW",
    color: "bg-green-600",
  },
  {
    id: 3,
    name: "Bob Roberts",
    role: "HVAC Specialist",
    team: "Alpha Team",
    jobs: 2,
    initials: "BR",
    color: "bg-purple-600",
  },
  {
    id: 4,
    name: "John Davis",
    role: "Plumber",
    team: "Beta Team",
    jobs: 5,
    initials: "JD",
    color: "bg-red-600",
  },
  {
    id: 5,
    name: "Amy Lee",
    role: "Technician",
    team: "Beta Team",
    jobs: 3,
    initials: "AL",
    color: "bg-orange-600",
  },
]

export function TeamsView() {
  return (
    <div className="h-full bg-white">
      <div className="flex h-full">
        {/* Left Side - Teams */}
        <div className="w-1/2 border-r border-gray-200 p-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-8">Teams</h1>

          <div className="flex flex-col items-center justify-center h-64">
            <Users className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No teams found</h3>
            <p className="text-gray-500 text-center">Teams will appear here once they are created.</p>
          </div>
        </div>

        {/* Right Side - All Team Members */}
        <div className="w-1/2 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">All Team Members</h2>

          <div className="space-y-4">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${member.color} rounded-full flex items-center justify-center`}>
                    <span className="text-white font-medium text-sm">{member.initials}</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-500">
                      {member.role} • {member.team}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-medium text-gray-900">{member.jobs} jobs</p>
                  <p className="text-sm text-gray-500">This week</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
