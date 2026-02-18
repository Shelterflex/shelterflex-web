"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Home,
  Building2,
  MessageSquare,
  Settings,
  User,
  Bell,
  Shield,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  Save,
  Eye,
  EyeOff,
  Star,
  Briefcase,
  Award,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { DashboardHeader } from "@/components/dashboard-header"
import { agentRecentPayouts } from "@/lib/mockData"

export default function AgentSettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "notifications" | "security" | "payment">("profile")
  const [showPassword, setShowPassword] = useState(false)

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "payment", label: "Earnings", icon: CreditCard },
  ]

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
              className="flex items-center gap-3 border-3 border-foreground bg-primary p-3 font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
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
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="mt-1 text-muted-foreground">Manage your account and agent profile</p>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 border-3 border-foreground px-4 py-3 font-bold transition-all ${
                  activeTab === tab.id
                    ? "bg-foreground text-background shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
                    : "bg-card hover:bg-muted"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Card className="border-3 border-foreground p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                  <h2 className="mb-6 text-xl font-bold">Profile Information</h2>
                  
                  <div className="mb-8 flex items-center gap-6">
                    <div className="flex h-24 w-24 items-center justify-center border-3 border-foreground bg-secondary text-3xl font-bold">
                      AJ
                    </div>
                    <div>
                      <Button variant="outline" className="border-3 border-foreground bg-transparent font-bold">
                        Change Photo
                      </Button>
                      <p className="mt-2 text-sm text-muted-foreground">JPG, PNG or GIF. Max 2MB</p>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="full-name" className="font-bold">Full Name</Label>
                      <Input
                        id="full-name"
                        defaultValue="Adebayo Johnson"
                        className="border-3 border-foreground bg-background py-5 shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="license-number" className="font-bold">License Number</Label>
                      <Input
                        id="license-number"
                        defaultValue="NIESV-2024-12345"
                        className="border-3 border-foreground bg-background py-5 shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="font-bold">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          defaultValue="adebayo.j@sheltaflex.com"
                          className="border-3 border-foreground bg-background py-5 pl-12 shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="font-bold">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="phone"
                          defaultValue="+234 802 345 6789"
                          className="border-3 border-foreground bg-background py-5 pl-12 shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="office-address" className="font-bold">Office Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="office-address"
                          defaultValue="25 Marina Street, Lagos Island, Lagos"
                          className="border-3 border-foreground bg-background py-5 pl-12 shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="bio" className="font-bold">Bio</Label>
                      <Textarea
                        id="bio"
                        defaultValue="Experienced property agent with 5+ years in the Lagos real estate market. Specializing in luxury apartments and commercial properties in Victoria Island, Lekki, and Ikoyi areas."
                        className="min-h-30 border-3 border-foreground bg-background shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button className="border-3 border-foreground bg-primary px-6 py-5 font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Agent Stats */}
              <Card className="border-3 border-foreground p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                <h3 className="mb-4 text-lg font-bold">Agent Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b-2 border-foreground/10 pb-4">
                    <div className="flex items-center gap-3">
                      <Star className="h-5 w-5 fill-accent text-accent" />
                      <span>Rating</span>
                    </div>
                    <span className="font-bold">4.8/5</span>
                  </div>
                  <div className="flex items-center justify-between border-b-2 border-foreground/10 pb-4">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5" />
                      <span>Properties Managed</span>
                    </div>
                    <span className="font-bold">12</span>
                  </div>
                  <div className="flex items-center justify-between border-b-2 border-foreground/10 pb-4">
                    <div className="flex items-center gap-3">
                      <Award className="h-5 w-5" />
                      <span>Successful Rentals</span>
                    </div>
                    <span className="font-bold">47</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5" />
                      <span>Reviews</span>
                    </div>
                    <span className="font-bold">127</span>
                  </div>
                </div>

                <div className="mt-6 border-3 border-foreground bg-secondary/30 p-4">
                  <p className="text-sm font-bold">Verified Agent</p>
                  <p className="text-xs text-muted-foreground">Your credentials have been verified</p>
                </div>
              </Card>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <Card className="border-3 border-foreground p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
              <h2 className="mb-6 text-xl font-bold">Notification Preferences</h2>
              
              <div className="space-y-6">
                {[
                  { title: "New Property Listings", description: "Get notified when landlords post new properties", defaultChecked: true },
                  { title: "Application Updates", description: "Get notified about your application status changes", defaultChecked: true },
                  { title: "Tenant Inquiries", description: "Get notified when tenants inquire about your listings", defaultChecked: true },
                  { title: "Messages", description: "Get notified when you receive new messages", defaultChecked: true },
                  { title: "Payment Notifications", description: "Get notified about commission payments", defaultChecked: true },
                  { title: "Market Updates", description: "Weekly market insights and trends", defaultChecked: false },
                ].map((item) => (
                  <div key={item.title} className="flex items-center justify-between border-b-2 border-foreground/10 pb-4 last:border-0">
                    <div>
                      <p className="font-bold">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch defaultChecked={item.defaultChecked} />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <Card className="border-3 border-foreground p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
              <h2 className="mb-6 text-xl font-bold">Security Settings</h2>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-bold">Change Password</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="current-password"
                          type={showPassword ? "text" : "password"}
                          className="border-3 border-foreground bg-background py-5 pr-12 shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    <div />
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        className="border-3 border-foreground bg-background py-5 shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                      <Input
                        id="confirm-new-password"
                        type="password"
                        className="border-3 border-foreground bg-background py-5 shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]"
                      />
                    </div>
                  </div>
                  <Button className="border-3 border-foreground bg-secondary font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                    Update Password
                  </Button>
                </div>

                <div className="border-t-2 border-foreground pt-6">
                  <h3 className="font-bold mb-4">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground">Add an extra layer of security to your account</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Earnings Tab */}
          {activeTab === "payment" && (
            <Card className="border-3 border-foreground p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
              <h2 className="mb-6 text-xl font-bold">Earnings & Payout</h2>
              
              <div className="space-y-6">
                {/* Earnings Summary */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="border-3 border-foreground bg-primary/10 p-4">
                    <p className="text-sm text-muted-foreground">This Month</p>
                    <p className="text-2xl font-bold">₦450,000</p>
                  </div>
                  <div className="border-3 border-foreground bg-secondary/10 p-4">
                    <p className="text-sm text-muted-foreground">Last Month</p>
                    <p className="text-2xl font-bold">₦380,000</p>
                  </div>
                  <div className="border-3 border-foreground bg-accent/10 p-4">
                    <p className="text-sm text-muted-foreground">Total Earnings</p>
                    <p className="text-2xl font-bold">₦4,250,000</p>
                  </div>
                </div>

                {/* Bank Account */}
                <div>
                  <h3 className="font-bold mb-4">Payout Account</h3>
                  <div className="border-3 border-foreground bg-muted p-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Bank Name</p>
                        <p className="font-bold">Access Bank</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Account Number</p>
                        <p className="font-bold">••••••7890</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Account Name</p>
                        <p className="font-bold">Adebayo Johnson</p>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="mt-4 border-3 border-foreground bg-transparent font-bold">
                    Update Bank Details
                  </Button>
                </div>

                {/* Recent Payouts */}
                <div className="border-t-2 border-foreground pt-6">
                  <h3 className="font-bold mb-4">Recent Payouts</h3>
                  <div className="space-y-3">
                    {agentRecentPayouts.map((payout) => (
                      <div key={payout.date} className="flex items-center justify-between border-b border-foreground/10 pb-3">
                        <div>
                          <p className="font-bold">{payout.property}</p>
                          <p className="text-sm text-muted-foreground">{payout.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{payout.amount}</p>
                          <span className="border-2 border-foreground bg-secondary px-2 py-0.5 text-xs font-bold">
                            {payout.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
