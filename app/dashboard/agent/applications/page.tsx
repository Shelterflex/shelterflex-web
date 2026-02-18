"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Home,
  Building2,
  MessageSquare,
  Settings,
  Star,
  Briefcase,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { agentApplications as applications } from "@/lib/mockData"

export default function AgentApplicationsPage() {
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "accepted" | "declined">("all")

  const filteredApplications = applications.filter((app) => {
    return statusFilter === "all" || app.status === statusFilter
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-secondary"
      case "declined":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-accent"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="h-5 w-5" />
      case "declined":
        return <XCircle className="h-5 w-5" />
      default:
        return <Clock className="h-5 w-5" />
    }
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
              className="flex items-center gap-3 border-3 border-foreground bg-card p-3 font-bold transition-all hover:bg-muted hover:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
            >
              <Building2 className="h-5 w-5" />
              My Properties
            </Link>
            <Link
              href="/dashboard/agent/applications"
              className="flex items-center gap-3 border-3 border-foreground bg-primary p-3 font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">My Applications</h1>
            <p className="mt-1 text-muted-foreground">Track your applications to manage properties</p>
          </div>

          {/* Stats */}
          <div className="mb-8 grid grid-cols-4 gap-4">
            <Card className="border-3 border-foreground p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-muted">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-xl font-bold">{applications.length}</p>
                </div>
              </div>
            </Card>
            <Card className="border-3 border-foreground p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-accent">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-xl font-bold">{applications.filter((a) => a.status === "pending").length}</p>
                </div>
              </div>
            </Card>
            <Card className="border-3 border-foreground p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-secondary">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Accepted</p>
                  <p className="text-xl font-bold">{applications.filter((a) => a.status === "accepted").length}</p>
                </div>
              </div>
            </Card>
            <Card className="border-3 border-foreground p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-destructive">
                  <XCircle className="h-5 w-5 text-destructive-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Declined</p>
                  <p className="text-xl font-bold">{applications.filter((a) => a.status === "declined").length}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6 flex gap-4">
            {[
              { id: "all", label: "All Applications" },
              { id: "pending", label: "Pending" },
              { id: "accepted", label: "Accepted" },
              { id: "declined", label: "Declined" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as typeof statusFilter)}
                className={`border-3 border-foreground px-6 py-3 font-bold transition-all ${
                  statusFilter === tab.id
                    ? "bg-foreground text-background shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
                    : "bg-card hover:bg-muted"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Applications List */}
          <div className="space-y-4">
            {filteredApplications.length === 0 ? (
              <Card className="border-3 border-foreground p-12 text-center shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                <Briefcase className="mx-auto h-16 w-16 text-muted-foreground" />
                <h3 className="mt-4 text-xl font-bold">No Applications</h3>
                <p className="mt-2 text-muted-foreground">
                  No applications found with this status.
                </p>
              </Card>
            ) : (
              filteredApplications.map((application) => (
                <Card
                  key={application.id}
                  className="border-3 border-foreground p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-6">
                      {/* Property Info */}
                      <div className="flex h-24 w-24 shrink-0 items-center justify-center border-3 border-foreground bg-muted">
                        <Building2 className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold">{application.property.title}</h3>
                          <span
                            className={`flex items-center gap-1 border-2 border-foreground px-3 py-1 text-sm font-bold ${getStatusColor(
                              application.status
                            )}`}
                          >
                            {getStatusIcon(application.status)}
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </span>
                        </div>
                        <p className="mt-1 flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {application.property.location}
                        </p>
                        <p className="mt-2 text-xl font-bold text-primary">
                          {formatCurrency(application.property.price)}
                          <span className="text-sm font-normal text-muted-foreground">/year</span>
                        </p>

                        <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Applied: {application.appliedAt}
                          </span>
                          {application.status === "accepted" && application.acceptedAt && (
                            <span className="flex items-center gap-1 text-secondary">
                              <CheckCircle className="h-4 w-4" />
                              Accepted: {application.acceptedAt}
                            </span>
                          )}
                          {application.status === "declined" && application.declinedAt && (
                            <span className="flex items-center gap-1 text-destructive">
                              <XCircle className="h-4 w-4" />
                              Declined: {application.declinedAt}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Landlord Info */}
                    <div className="flex items-center gap-3 border-3 border-foreground bg-muted/50 px-4 py-3">
                      <div className="flex h-12 w-12 items-center justify-center border-2 border-foreground bg-accent font-bold">
                        {application.landlord.avatar}
                      </div>
                      <div>
                        <p className="font-bold">{application.landlord.name}</p>
                        <p className="text-sm text-muted-foreground">Landlord</p>
                      </div>
                    </div>
                  </div>

                  {/* Application Message */}
                  <div className="mt-4 border-t-2 border-foreground pt-4">
                    <p className="text-sm text-muted-foreground">Your message:</p>
                    <p className="mt-1 text-foreground">&ldquo;{application.message}&rdquo;</p>
                    {application.status === "declined" && application.declineReason && (
                      <div className="mt-3 border-3 border-destructive bg-destructive/10 p-3">
                        <p className="text-sm font-bold text-destructive">Reason: {application.declineReason}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex justify-end gap-3">
                    {application.status === "accepted" && (
                      <Link href="/messages">
                        <Button className="border-3 border-foreground bg-secondary font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Message Landlord
                        </Button>
                      </Link>
                    )}
                    {application.status === "pending" && (
                      <Button
                        variant="outline"
                        className="border-3 border-foreground bg-transparent font-bold"
                      >
                        Withdraw Application
                      </Button>
                    )}
                    {application.status === "declined" && (
                      <Link href="/dashboard/agent">
                        <Button className="border-3 border-foreground bg-primary font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                          Find More Properties
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    )}
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
