"use client"

import Link from "next/link"
import {
  Home,
  Building2,
  Users,
  MessageSquare,
  Settings,
  Star,
  Phone,
  Mail,
  MoreVertical,
  UserMinus,
  CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  landlordAgentsStats as stats,
  landlordMyAgents as myAgents,
} from "@/lib/mockData"

export default function LandlordAgentsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r-3 border-foreground bg-card pt-20">
        <div className="flex h-full flex-col px-4 py-6">
          <div className="mb-8 border-3 border-foreground bg-accent p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
            <p className="text-sm font-medium text-foreground">Logged in as</p>
            <p className="text-lg font-bold text-foreground">Chief Okonkwo</p>
            <p className="text-sm text-muted-foreground">Landlord</p>
          </div>

          <nav className="flex-1 space-y-2">
            <Link
              href="/dashboard/landlord"
              className="flex items-center gap-3 border-3 border-foreground bg-card p-3 font-bold transition-all hover:bg-muted hover:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
            >
              <Home className="h-5 w-5" />
              Dashboard
            </Link>
            <Link
              href="/dashboard/landlord/properties"
              className="flex items-center gap-3 border-3 border-foreground bg-card p-3 font-bold transition-all hover:bg-muted hover:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
            >
              <Building2 className="h-5 w-5" />
              My Properties
            </Link>
            <Link
              href="/dashboard/landlord/agents"
              className="flex items-center gap-3 border-3 border-foreground bg-primary p-3 font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
            >
              <Users className="h-5 w-5" />
              My Agents
            </Link>
            <Link
              href="/messages"
              className="flex items-center gap-3 border-3 border-foreground bg-card p-3 font-bold transition-all hover:bg-muted hover:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
            >
              <MessageSquare className="h-5 w-5" />
              Messages
            </Link>
            <Link
              href="/dashboard/landlord/settings"
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
            <h1 className="text-3xl font-bold text-foreground">My Agents</h1>
            <p className="mt-1 text-muted-foreground">Manage agents working on your properties</p>
          </div>

          {/* Stats Grid */}
          <div className="mb-8 grid grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="border-3 border-foreground p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center border-3 border-foreground bg-secondary">
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Agents List */}
          <div className="grid gap-6">
            {myAgents.map((agent) => (
              <Card key={agent.id} className="border-3 border-foreground p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                <div className="flex items-start justify-between">
                  <div className="flex gap-6">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="flex h-20 w-20 items-center justify-center border-3 border-foreground bg-accent text-2xl font-bold">
                        {agent.avatar}
                      </div>
                      {agent.verified && (
                        <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center border-2 border-foreground bg-secondary">
                          <CheckCircle className="h-4 w-4" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold">{agent.name}</h3>
                        <div className="flex items-center gap-1 border-2 border-foreground bg-accent px-2 py-0.5">
                          <Star className="h-4 w-4 fill-foreground" />
                          <span className="font-bold">{agent.rating}</span>
                          <span className="text-xs text-muted-foreground">({agent.reviews})</span>
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">Agent since {agent.joinedDate}</p>

                      <div className="mt-4 flex gap-6 text-sm">
                        <div>
                          <p className="text-muted-foreground">Properties</p>
                          <p className="font-bold">{agent.properties}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Inquiries</p>
                          <p className="font-bold">{agent.totalInquiries}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Response Time</p>
                          <p className="font-bold">{agent.responseTime}</p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground mb-2">Managing:</p>
                        <div className="flex flex-wrap gap-2">
                          {agent.propertyNames.map((name) => (
                            <span key={name} className="border-2 border-foreground bg-muted px-3 py-1 text-sm font-medium">
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-start gap-2">
                    <Link href="/messages">
                      <Button className="border-3 border-foreground bg-secondary font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Message
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="border-3 border-foreground bg-transparent">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="border-3 border-foreground">
                        <DropdownMenuItem><Phone className="mr-2 h-4 w-4" /> Request Call</DropdownMenuItem>
                        <DropdownMenuItem><Mail className="mr-2 h-4 w-4" /> Send Email</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive"><UserMinus className="mr-2 h-4 w-4" /> Remove Agent</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
