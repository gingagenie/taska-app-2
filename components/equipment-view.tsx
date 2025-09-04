"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MoreHorizontal } from "lucide-react"

const equipmentData = [
  {
    id: 1,
    name: "3t Forklift",
    make: "Linde 391 EVO",
    serial: "vnsdkjgnskjbkjs",
    customer: "Plant Access",
    address: "45 Madden Road, Heatherton, Victoria, 3202",
  },
  {
    id: 2,
    name: "Brewing Tank Pump",
    make: "Grundfos CR 64-2",
    serial: "GRU64-2024-BR1",
    customer: "Jetty Road Brewery",
    address: "12-14 Brasser Ave, Dromana, VIC, 3936",
    notes: "Stainless steel pump for brewery operations",
  },
  {
    id: 3,
    name: "Concrete Mixer",
    make: "Multiquip CM12HD",
    serial: "MQ12HD-2024-007",
    customer: "Plant Access",
    address: "45 Madden Road, Heatherton, Victoria, 3202",
    notes: "12 cubic ft portable concrete mixer",
  },
  {
    id: 4,
    name: "Hydraulic Excavator",
    make: "Caterpillar 320D",
    serial: "CAT320D2024001",
    customer: "Bundameer Nurseries",
    address: "218 Coolart Road, MOOROODUC, VIC, 3933",
    notes: "",
  },
]

export function EquipmentView() {
  return (
    <div className="h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Equipment</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input placeholder="Search name, make, model, serial..." className="pl-10 w-64" />
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">New Equipment</Button>
          </div>
        </div>
      </div>

      {/* Equipment List */}
      <div className="p-6 space-y-4">
        {equipmentData.map((equipment) => (
          <div key={equipment.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{equipment.name}</h3>

                <div className="grid grid-cols-3 gap-8 text-sm mb-4">
                  <div>
                    <span className="text-gray-500">Make & Model</span>
                    <p className="font-medium text-gray-900">{equipment.make}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Serial</span>
                    <p className="font-medium text-gray-900">{equipment.serial}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Customer</span>
                    <p className="font-medium text-gray-900">{equipment.customer}</p>
                    <p className="text-gray-600 text-xs mt-1">{equipment.address}</p>
                  </div>
                </div>

                {equipment.notes && (
                  <div className="text-sm">
                    <span className="text-gray-500">Notes</span>
                    <p className="text-gray-700">{equipment.notes}</p>
                  </div>
                )}
              </div>

              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
