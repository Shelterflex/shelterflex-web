"use client";

import Link from "next/link";
import {
  ArrowLeft,
  DollarSign,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Card } from "@/components/ui/card";

export default function WhistleblowerEarningsPage() {
  const earnings = [
    {
      id: 1,
      date: "Dec 15, 2024",
      listing: "Block 5, Flat 2B, Yaba",
      tenant: "Ngozi Adekunle",
      amount: 15000,
      status: "pending",
      daysLeft: 3,
    },
    {
      id: 2,
      date: "Nov 28, 2024",
      listing: "Block 3, Flat 1C, Yaba",
      tenant: "Chukwu Eze",
      amount: 20000,
      status: "completed",
      completedDate: "Dec 2, 2024",
    },
    {
      id: 3,
      date: "Nov 10, 2024",
      listing: "Block 2, Flat 4D, Yaba",
      tenant: "Adanna Smith",
      amount: 12000,
      status: "completed",
      completedDate: "Nov 15, 2024",
    },
  ];

  const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
  const completedEarnings = earnings
    .filter((e) => e.status === "completed")
    .reduce((sum, e) => sum + e.amount, 0);
  const pendingEarnings = earnings
    .filter((e) => e.status === "pending")
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/whistleblower/dashboard"
          className="inline-flex items-center gap-2 mb-8 text-sm font-bold border-b-2 border-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-black mb-2">Your Earnings</h1>
            <p className="text-muted-foreground">
              Track your income from reporting vacant apartments
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6 mb-8">
            <Card className="border-3 border-foreground p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center border-3 border-foreground bg-primary md:h-14 md:w-14">
                  <DollarSign className="h-6 w-6 md:h-7 md:w-7" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground md:text-sm">
                    Total Earnings
                  </p>
                  <p className="text-2xl font-black md:text-3xl">
                    ₦{totalEarnings.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="border-3 border-foreground p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center border-3 border-foreground bg-secondary md:h-14 md:w-14">
                  <CheckCircle className="h-6 w-6 md:h-7 md:w-7" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground md:text-sm">
                    Completed
                  </p>
                  <p className="text-2xl font-black md:text-3xl">
                    ₦{completedEarnings.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="border-3 border-foreground p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center border-3 border-foreground bg-accent md:h-14 md:w-14">
                  <Clock className="h-6 w-6 md:h-7 md:w-7" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground md:text-sm">
                    Pending
                  </p>
                  <p className="text-2xl font-black md:text-3xl">
                    ₦{pendingEarnings.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Earnings List */}
          <div>
            <h2 className="font-mono text-lg font-bold mb-4 md:text-xl">
              Earnings History
            </h2>
            <div className="space-y-3">
              {earnings.map((earning) => (
                <Card
                  key={earning.id}
                  className="border-3 border-foreground p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:p-6"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <p className="font-bold text-sm md:text-base">
                        {earning.listing}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Tenant: {earning.tenant} • Posted: {earning.date}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-3 border-t-2 border-foreground md:border-t-0 md:border-l-2 md:pl-4">
                      <div>
                        <p className="text-lg font-black text-primary md:text-2xl">
                          ₦{earning.amount.toLocaleString()}
                        </p>
                        {earning.status === "pending" ? (
                          <p className="text-xs text-muted-foreground">
                            Credited in {earning.daysLeft} days
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            Completed {earning.completedDate}
                          </p>
                        )}
                      </div>

                      <div
                        className={`flex items-center gap-1 px-3 py-1 border-2 border-foreground font-bold text-xs whitespace-nowrap ${earning.status === "completed" ? "bg-secondary" : "bg-accent"}`}
                      >
                        {earning.status === "completed" ? (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Completed
                          </>
                        ) : (
                          <>
                            <Clock className="h-4 w-4" />
                            Pending
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Payment Info */}
          <Card className="border-3 border-foreground p-4 mt-8 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:p-6 bg-muted">
            <h3 className="font-bold mb-3">How Payments Work</h3>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>
                • Earnings are credited after the tenant's first payment
                (typically 3-5 days after rental confirmation)
              </li>
              <li>• Payments are transferred directly to your bank account</li>
              <li>• You can withdraw anytime (minimum ₦5,000)</li>
              <li>• Transaction fee: 2% of withdrawal amount</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
