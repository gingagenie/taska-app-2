"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"

const jobsData = [
  {
    id: 1,
    title: "Concrete Mixer Repair",
    date: 22,
    status: "scheduled",
    color: "bg-blue-100 text-blue-800",
  },
  {
    id: 2,
    title: "HVAC Filter...",
    date: 22,
    status: "scheduled",
    color: "bg-blue-100 text-blue-800",
  },
  {
    id: 3,
    title: "Excavator Annual...",
    date: 23,
    status: "scheduled",
    color: "bg-blue-100 text-blue-800",
  },
  {
    id: 4,
    title: "Brewery Pump...",
    date: 24,
    status: "scheduled",
    color: "bg-blue-100 text-blue-800",
  },
  {
    id: 5,
    title: "Irrigation System...",
    date: 25,
    status: "in-progress",
    color: "bg-blue-100 text-blue-800",
  },
  {
    id: 6,
    title: "Burst hose — Plant...",
    date: 25,
    status: "in-progress",
    color: "bg-blue-100 text-blue-800",
  },
]

export function ScheduleView() {
  const [currentDate, setCurrentDate] = useState("28 Jul - 31 Aug 2025")

  const daysOfWeek = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
  const dates = [
    [28, 29, 30, 31, 1, 2, 3],
    [4, 5, 6, 7, 8, 9, 10],
    [11, 12, 13, 14, 15, 16, 17],
    [18, 19, 20, 21, 22, 23, 24],
    [25, 26, 27, 28, 29, 30, 31],
  ]

  return (
    <div className="h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Schedule</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                Month view
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" size="sm">
                All technicians
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                Today
              </Button>
              <Button variant="outline" size="sm">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium text-gray-700">{currentDate}</span>
              <Button variant="outline" size="sm">
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">Next</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="p-6">
        {/* Calendar Header */}
        <div className="grid grid-cols-7 gap-4 mb-4">
          {daysOfWeek.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="space-y-4">
          {dates.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-4">
              {week.map((date, dateIndex) => (
                <div key={dateIndex} className="min-h-[120px] border border-gray-200 rounded-lg p-2">
                  <div className="text-sm font-medium text-gray-900 mb-2">{date}</div>
                  <div className="space-y-1">
                    {jobsData
                      .filter((job) => job.date === date)
                      .map((job) => (
                        <div key={job.id} className={`text-xs p-2 rounded ${job.color} truncate`}>
                          {job.title}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
