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
  Star,
  Briefcase,
  Search,
  Filter,
  Plus,
  TrendingUp,
  Clock,
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
import { agentManagedPropertiesWithMetrics as managedProperties } from "@/lib/mockData"

export default function AgentPropertiesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredProperties = managedProperties.filter((property) => {
    const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || property.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r-3 border-foreground bg-card pt-20">
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
              className="flex items-center gap-3 border-3 border-foreground bg-card p-3 font-bold transition-all hover:bg-muted hover:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
            >
              <Home className="h-5 w-5" />
              Dashboard
            </Link>
            <Link
              href="/dashboard/agent/properties"
              className="flex items-center gap-3 border-3 border-foreground bg-primary p-3 font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
            >
              <Building2 className="h-5 w-5" />
              My Properties
            </Link>
            <Link
              href="/dashboard/agent/applications"
              className="flex items-center gap-3 border-3 border-foreground bg-card p-3 font-bold transition-all hover:bg-muted hover:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
            >
              <Briefcase className="h-5 w-5" />
              Applications
            </Link>
            <Link
              href="/messages"
              className="flex items-center gap-3 border-3 border-foreground bg-card p-3 font-bold transition-all hover:bg-muted hover:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
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
            >
              <Settings className="h-5 w-5" />
              Settings
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen pt-20">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Properties</h1>
              <p className="mt-1 text-muted-foreground">Manage properties you represent</p>
            </div>
            <Link href="/dashboard/agent">
              <Button className="border-3 border-foreground bg-primary font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                <Plus className="mr-2 h-4 w-4" />
                Find Properties
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mb-8 grid grid-cols-4 gap-4">
            <Card className="border-3 border-foreground p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-primary">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Properties</p>
                  <p className="text-xl font-bold">{managedProperties.length}</p>
                </div>
              </div>
            </Card>
            <Card className="border-3 border-foreground p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-secondary">
                  <Eye className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                  <p className="text-xl font-bold">{managedProperties.reduce((sum, p) => sum + p.views, 0)}</p>
                </div>
              </div>
            </Card>
            <Card className="border-3 border-foreground p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-accent">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Inquiries</p>
                  <p className="text-xl font-bold">{managedProperties.reduce((sum, p) => sum + p.inquiries, 0)}</p>
                </div>
              </div>
            </Card>
            <Card className="border-3 border-foreground p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-muted">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Listings</p>
                  <p className="text-xl font-bold">{managedProperties.filter((p) => p.status === "active").length}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Search and Filter */}
          <div className="mb-6 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-3 border-foreground py-6 pl-12 text-lg shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 border-3 border-foreground py-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="border-3 border-foreground">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="rented">Rented</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Properties List */}
          <div className="grid gap-6">
            {filteredProperties.length === 0 ? (
              <Card className="border-3 border-foreground p-12 text-center shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                <Building2 className="mx-auto h-16 w-16 text-muted-foreground" />
                <h3 className="mt-4 text-xl font-bold">No Properties Found</h3>
                <p className="mt-2 text-muted-foreground">
                  No properties match your search criteria.
                </p>
              </Card>
            ) : (
              filteredProperties.map((property) => (
                <Card
                  key={property.id}
                  className="border-3 border-foreground p-0 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
                >
                  <div className="flex">
                    <div className="relative h-48 w-72 shrink-0 border-r-3 border-foreground bg-muted">
                      <div className="flex h-full items-center justify-center">
                        <Building2 className="h-16 w-16 text-muted-foreground" />
                      </div>
                      <div
                        className={`absolute left-3 top-3 border-2 border-foreground px-3 py-1 text-sm font-bold ${
                          property.status === "active" ? "bg-secondary" : "bg-muted"
                        }`}
                      >
                        {property.status === "active" ? "Active" : "Rented"}
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      <div className="mb-4 flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-foreground">{property.title}</h3>
                          <p className="mt-1 flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {property.location}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 border-3 border-foreground bg-muted/50 px-4 py-2">
                          <div className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-accent font-bold">
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
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" /> Listed {property.listedDate}
                        </span>
                      </div>

                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <p className="text-2xl font-bold text-primary">
                            {formatCurrency(property.price)}
                            <span className="text-sm font-normal text-muted-foreground">/year</span>
                          </p>
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Eye className="h-4 w-4" /> {property.views} views
                          </span>
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MessageSquare className="h-4 w-4" /> {property.inquiries} inquiries
                          </span>
                        </div>
                        <Link href={`/properties/${property.id}`}>
                          <Button className="border-3 border-foreground bg-secondary font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
                            <Eye className="mr-2 h-4 w-4" />
                            View Listing
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
