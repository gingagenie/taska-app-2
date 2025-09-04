"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MoreHorizontal } from "lucide-react"

const customersData = [
  {
    id: 1,
    name: "Bundameer Nurseries",
    contact: "Warwick Grant",
    email: "bundameermanager@gmail.com",
    phone: "0437458147",
    address: "218 Coolart Road, MOOROODUC, VIC, 3933",
    initials: "BN",
    color: "bg-purple-600",
  },
  {
    id: 2,
    name: "Jetty Road Brewery",
    contact: "Sean Varley",
    email: "sean@jettyroad.com.au",
    phone: "0408031155",
    address: "12-14 Brasser Ave, Dromana, VIC, 3936",
    initials: "JR",
    color: "bg-green-600",
  },
  {
    id: 3,
    name: "Plant Access",
    contact: "Koczak",
    email: "cameron@plantaccess.com.au",
    phone: "—",
    address: "45 Madden Road, Heatherton, Victoria, 3202",
    initials: "PA",
    color: "bg-teal-600",
  },
  {
    id: 4,
    name: "Southern Advanced Plants",
    contact: "Emma Wilson",
    email: "emma@southernplants.com.au",
    phone: "0401296502",
    address: "163 Nepean Highway, Dromana, Vic, 3936",
    initials: "SA",
    color: "bg-purple-600",
  },
  {
    id: 5,
    name: "The Brand Licensing Group",
    contact: "Dean Snoxell",
    email: "",
    phone: "",
    address: "",
    initials: "TB",
    color: "bg-red-600",
  },
]

export function CustomersView() {
  return (
    <div className="h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input placeholder="Search company, contact, email..." className="pl-10 w-64" />
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">New Customer</Button>
          </div>
        </div>
      </div>

      {/* Customers List */}
      <div className="p-6 space-y-4">
        {customersData.map((customer) => (
          <div key={customer.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 ${customer.color} rounded-full flex items-center justify-center`}>
                  <span className="text-white font-medium text-sm">{customer.initials}</span>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">{customer.name}</h3>
                  <p className="text-gray-600 mb-4">Contact: {customer.contact}</p>

                  <div className="grid grid-cols-3 gap-8 text-sm">
                    <div>
                      <span className="text-gray-500">Email</span>
                      <p className="font-medium text-gray-900">{customer.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Phone</span>
                      <p className="font-medium text-gray-900">{customer.phone}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Address</span>
                      <p className="font-medium text-gray-900">{customer.address}</p>
                    </div>
                  </div>
                </div>
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
