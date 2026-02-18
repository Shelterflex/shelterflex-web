"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Home,
  Building2,
  MessageSquare,
  Settings,
  MapPin,
  Bed,
  Bath,
  Square,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Star,
  Send,
  Search,
  Filter,
  Briefcase,
  Menu,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DashboardHeader } from "@/components/dashboard-header"
import {
  agentAvailableProperties as availableProperties,
  agentDashboardStats as stats,
  agentManagedProperties as managedProperties,
  agentMyApplications as myApplications,
} from "@/lib/mockData"

export default function AgentDashboard() {
  const [activeTab, setActiveTab] = useState<"managed" | "available" | "applications">("managed")
  const [searchQuery, setSearchQuery] = useState("")
  const [locationFilter, setLocationFilter] = useState("all")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const filteredAvailable = availableProperties.filter((property) => {
    const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLocation = locationFilter === "all" || property.location.toLowerCase().includes(locationFilter.toLowerCase())
    return matchesSearch && matchesLocation
  })

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center border-3 border-foreground bg-primary shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] lg:hidden"
      >
        {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-foreground/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 z-40 h-screen w-64 border-r-3 border-foreground bg-card pt-20 transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col px-4 py-6">
          <div className="mb-8 border-3 border-foreground bg-secondary p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
            <p className="text-sm font-medium text-foreground">Logged in as</p>
            <p className="text-lg font-bold text-foreground">Adebayo Johnson</p>
            <p className="text-sm text-muted-foreground">Property Agent</p>
            <div className="mt-2 flex items-center gap-1">
              <Star className="h-4 w-4 fill-accent text-accent" />
              <span className="text-sm font-bold">4.8</span>
              <span className="text-xs text-muted-foreground">(127 reviews)</span>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            <Link
              href="/dashboard/agent"
              className="flex items-center gap-3 border-3 border-foreground bg-primary p-3 font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
              onClick={() => setSidebarOpen(false)}
            >
              <Home className="h-5 w-5" />
              Dashboard
            </Link>
            <Link
              href="/dashboard/agent/properties"
              className="flex items-center gap-3 border-3 border-foreground bg-card p-3 font-bold transition-all hover:bg-muted hover:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
              onClick={() => setSidebarOpen(false)}
            >
              <Building2 className="h-5 w-5" />
              My Properties
            </Link>
            <Link
              href="/dashboard/agent/applications"
              className="flex items-center gap-3 border-3 border-foreground bg-card p-3 font-bold transition-all hover:bg-muted hover:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
              onClick={() => setSidebarOpen(false)}
            >
              <Briefcase className="h-5 w-5" />
              Applications
            </Link>
            <Link
              href="/messages"
              className="flex items-center gap-3 border-3 border-foreground bg-card p-3 font-bold transition-all hover:bg-muted hover:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
              onClick={() => setSidebarOpen(false)}
            >
              <MessageSquare className="h-5 w-5" />
              Messages
              <span className="ml-auto flex h-6 w-6 items-center justify-center border-2 border-foreground bg-destructive text-xs font-bold text-destructive-foreground">
                5
              </span>
            </Link>
            <Link
              href="/dashboard/agent/settings"
              className="flex items-center gap-3 border-3 border-foreground bg-card p-3 font-bold transition-all hover:bg-muted hover:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
              onClick={() => setSidebarOpen(false)}
            >
              <Settings className="h-5 w-5" />
              Settings
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-h-screen pt-20 lg:ml-64">
        <div className="p-4 md:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl font-bold text-foreground md:text-3xl lg:text-4xl">Welcome, Adebayo!</h1>
            <p className="mt-2 text-sm text-muted-foreground md:text-base lg:text-lg">
              Manage your properties and find new opportunities
            </p>
          </div>

          {/* Stats Grid */}
          <div className="mb-6 grid grid-cols-2 gap-3 md:mb-8 md:grid-cols-4 md:gap-6">
            {stats.map((stat) => (
              <Card
                key={stat.label}
                className="border-3 border-foreground p-3 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:p-6"
              >
                <div className="flex items-center gap-2 md:gap-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center border-3 border-foreground md:h-14 md:w-14 ${stat.color}`}
                  >
                    <stat.icon className="h-5 w-5 md:h-7 md:w-7" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-muted-foreground md:text-sm">{stat.label}</p>
                    <p className="truncate text-xl font-bold text-foreground md:text-3xl">{stat.value}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Tabs */}
          <div className="mb-6 flex flex-wrap gap-2 md:gap-4">
            <button
              onClick={() => setActiveTab("managed")}
              className={`border-3 border-foreground px-3 py-2 text-sm font-bold transition-all md:px-6 md:py-3 md:text-base ${
                activeTab === "managed"
                  ? "bg-foreground text-background shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
                  : "bg-card hover:bg-muted"
              }`}
            >
              Properties
            </button>
            <button
              onClick={() => setActiveTab("available")}
              className={`border-3 border-foreground px-3 py-2 text-sm font-bold transition-all md:px-6 md:py-3 md:text-base ${
                activeTab === "available"
                  ? "bg-foreground text-background shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
                  : "bg-card hover:bg-muted"
              }`}
            >
              Available
            </button>
            <button
              onClick={() => setActiveTab("applications")}
              className={`border-3 border-foreground px-3 py-2 text-sm font-bold transition-all md:px-6 md:py-3 md:text-base ${
                activeTab === "applications"
                  ? "bg-foreground text-background shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
                  : "bg-card hover:bg-muted"
              }`}
            >
              Applications
              {myApplications.some((a) => a.status === "pending") && (
                <span className="ml-2 inline-flex h-5 w-5 items-center justify-center border-2 border-foreground bg-accent text-xs md:h-6 md:w-6">
                  {myApplications.filter((a) => a.status === "pending").length}
                </span>
              )}
            </button>
          </div>

          {/* Managed Properties Tab */}
          {activeTab === "managed" && (
            <div className="grid gap-6">
              {managedProperties.length === 0 ? (
                <Card className="border-3 border-foreground p-12 text-center shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                  <Building2 className="mx-auto h-16 w-16 text-muted-foreground" />
                  <h3 className="mt-4 text-xl font-bold">No Properties Yet</h3>
                  <p className="mt-2 text-muted-foreground">
                    Apply to manage properties from the Available Properties tab.
                  </p>
                  <Button
                    onClick={() => setActiveTab("available")}
                    className="mt-4 border-3 border-foreground bg-primary font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
                  >
                    Browse Available Properties
                  </Button>
                </Card>
              ) : (
                managedProperties.map((property) => (
                  <Card
                    key={property.id}
                    className="border-3 border-foreground p-0 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="relative aspect-video w-full border-b-3 border-foreground bg-muted md:h-48 md:w-72 md:border-b-0 md:border-r-3">
                        <div className="flex h-full items-center justify-center">
                          <Building2 className="h-12 w-12 text-muted-foreground md:h-16 md:w-16" />
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col p-4 md:p-6">
                        <div className="mb-3 flex flex-col gap-3 md:mb-4 md:flex-row md:items-start md:justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-foreground md:text-xl">{property.title}</h3>
                            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              {property.location}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 border-3 border-foreground bg-muted/50 px-3 py-2 md:gap-3 md:px-4">
                            <div className="flex h-8 w-8 items-center justify-center border-2 border-foreground bg-accent text-sm font-bold md:h-10 md:w-10">
                              {property.landlord.avatar}
                            </div>
                            <div>
                              <p className="text-xs font-bold md:text-sm">{property.landlord.name}</p>
                              <p className="text-xs text-muted-foreground">Landlord</p>
                            </div>
                          </div>
                        </div>

                        <div className="mb-3 flex flex-wrap gap-3 md:mb-4 md:gap-6">
                          <span className="flex items-center gap-1 text-xs font-medium md:text-sm">
                            <Bed className="h-4 w-4" /> {property.beds} Beds
                          </span>
                          <span className="flex items-center gap-1 text-xs font-medium md:text-sm">
                            <Bath className="h-4 w-4" /> {property.baths} Baths
                          </span>
                          <span className="flex items-center gap-1 text-xs font-medium md:text-sm">
                            <Square className="h-4 w-4" /> {property.sqm} sqm
                          </span>
                        </div>

                        <div className="mt-auto flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <p className="text-xl font-bold text-primary md:text-2xl">
                            ₦{property.price.toLocaleString()}
                            <span className="text-xs font-normal text-muted-foreground md:text-sm">/year</span>
                          </p>
                          <div className="flex flex-wrap items-center gap-3 md:gap-4">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground md:text-sm">
                              <MessageSquare className="h-4 w-4" /> {property.inquiries} inquiries
                            </span>
                            <Link href={`/properties/${property.id}`}>
                              <Button className="border-3 border-foreground bg-secondary text-sm font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Available Properties Tab */}
          {activeTab === "available" && (
            <div>
              {/* Search and Filter */}
              <div className="mb-6 flex flex-col gap-3 md:flex-row md:gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search properties..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-3 border-foreground py-4 pl-12 text-base shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:py-6 md:text-lg"
                  />
                </div>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="w-full border-3 border-foreground py-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:w-48 md:py-6">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent className="border-3 border-foreground">
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="victoria island">Victoria Island</SelectItem>
                    <SelectItem value="lekki">Lekki</SelectItem>
                    <SelectItem value="ikoyi">Ikoyi</SelectItem>
                    <SelectItem value="banana island">Banana Island</SelectItem>
                    <SelectItem value="yaba">Yaba</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 md:gap-6">
                {filteredAvailable.map((property) => (
                  <Card
                    key={property.id}
                    className="border-3 border-foreground p-0 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="relative aspect-video w-full border-b-3 border-foreground bg-muted md:h-48 md:w-72 md:border-b-0 md:border-r-3">
                        <div className="flex h-full items-center justify-center">
                          <Building2 className="h-12 w-12 text-muted-foreground md:h-16 md:w-16" />
                        </div>
                        <div className="absolute left-3 top-3 border-2 border-foreground bg-accent px-2 py-1 text-xs font-bold md:px-3 md:text-sm">
                          {property.postedAt}
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col p-4 md:p-6">
                        <div className="mb-3 flex flex-col gap-3 md:mb-4 md:flex-row md:items-start md:justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-foreground md:text-xl">{property.title}</h3>
                            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              {property.location}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 border-3 border-foreground bg-muted/50 px-3 py-2 md:gap-3 md:px-4">
                            <div className="flex h-8 w-8 items-center justify-center border-2 border-foreground bg-accent text-sm font-bold md:h-10 md:w-10">
                              {property.landlord.avatar}
                            </div>
                            <div>
                              <p className="text-sm font-bold">{property.landlord.name}</p>
                              <p className="text-xs text-muted-foreground">Landlord</p>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4 flex gap-6">
                          <span className="flex items-center gap-1 text-sm font-medium">
                            <Bed className="h-4 w-4" /> {property.beds} Beds
                          </span>
                          <span className="flex items-center gap-1 text-sm font-medium">
                            <Bath className="h-4 w-4" /> {property.baths} Baths
                          </span>
                          <span className="flex items-center gap-1 text-sm font-medium">
                            <Square className="h-4 w-4" /> {property.sqm} sqm
                          </span>
                        </div>

                        <div className="mt-auto flex items-center justify-between">
                          <p className="text-2xl font-bold text-primary">
                            ₦{property.price.toLocaleString()}
                            <span className="text-sm font-normal text-muted-foreground">/year</span>
                          </p>
                          <Link href="/dashboard/agent/apply">
                            <Button className="border-3 border-foreground bg-primary font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
                              <Send className="mr-2 h-4 w-4" />
                              Apply to Manage
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === "applications" && (
            <div className="grid gap-4">
              {myApplications.map((application) => (
                <Card
                  key={application.id}
                  className="border-3 border-foreground p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
                >
                  {(() => {
                    let statusClass = "bg-muted";
                    if (application.status === "accepted") statusClass = "bg-secondary";
                    else if (application.status === "pending") statusClass = "bg-accent";

                    return (
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold">{application.property}</h3>
                          <p className="text-sm text-muted-foreground">
                            Landlord: {application.landlord} • Applied {application.appliedAt}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div
                            className={`flex items-center gap-2 border-3 border-foreground px-4 py-2 font-bold ${statusClass}`}
                          >
                            {application.status === "accepted" && (
                              <CheckCircle className="h-4 w-4" />
                            )}
                            {application.status === "pending" && (
                              <Clock className="h-4 w-4" />
                            )}
                            {application.status === "declined" && (
                              <XCircle className="h-4 w-4" />
                            )}
                            <span className="capitalize">{application.status}</span>
                          </div>
                          {application.status === "pending" && (
                            <Button
                              variant="outline"
                              className="border-3 border-foreground bg-transparent font-bold"
                            >
                              Withdraw
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
