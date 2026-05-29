"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { ArrowRight, Info, Check, AlertCircle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

const INTEREST_TIERS: Record<number, number> = {
  3: 0.08,
  6: 0.12,
  12: 0.15,
}

export default function CalculatorPage() {
  const [annualRent, setAnnualRent] = useState(2400000)
  const [depositPercent, setDepositPercent] = useState(20)
  const [duration, setDuration] = useState(12)
  const [paymentType, setPaymentType] = useState<"outright" | "installment">("installment")

  const deposit = Math.round(annualRent * (depositPercent / 100))
  const minDeposit = annualRent * 0.2

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Outright pricing (no interest)
  const outrightTotal = annualRent
  const outrightBalance = outrightTotal - deposit

  // Installment pricing
  const interestRate = INTEREST_TIERS[duration] || 0.15
  const financedAmount = annualRent - deposit
  const interestAmount = Math.round(financedAmount * interestRate)
  const totalRepayment = financedAmount + interestAmount
  const monthlyPayment = Math.round((totalRepayment / duration) * 100) / 100

  // Savings comparison
  const savingsVsInstallment = totalRepayment - outrightTotal

  const scheduleBaseTime = Date.UTC(2025, 0, 1)
  const paymentSchedule = Array.from({ length: duration }, (_, i) => ({
    month: i + 1,
    amount: monthlyPayment,
    date: new Date(scheduleBaseTime + (i + 1) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-NG", {
      month: "short",
      year: "numeric",
    }),
  }))

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="border-b-3 border-foreground bg-muted py-8 md:py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <h1 className="mb-3 font-mono text-2xl font-black md:mb-4 md:text-4xl lg:text-5xl">
            Payment <span className="text-primary">Calculator</span>
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl md:text-base lg:text-lg">
            See exactly how much you will pay. Choose between paying in full or spreading it over installments.
          </p>
        </div>
      </section>

      <section className="py-8 md:py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 md:gap-8 lg:grid-cols-2">
            {/* Calculator Inputs */}
            <div className="space-y-6 md:space-y-8">
              <div className="border-3 border-foreground bg-card p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:p-6">
                <h2 className="mb-4 font-mono text-lg font-bold md:mb-6 md:text-xl">Configure Your Plan</h2>

                {/* Annual Rent */}
                <div className="mb-6 md:mb-8">
                  <div className="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-mono text-xs font-bold sm:text-sm">Annual Rent</p>
                    <span className="border-2 border-foreground bg-muted px-2 py-1 font-mono text-base font-black sm:px-3 sm:text-lg">
                      {formatCurrency(annualRent)}
                    </span>
                  </div>
                  <Slider
                    value={[annualRent]}
                    onValueChange={(value) => setAnnualRent(value[0])}
                    min={500000}
                    max={20000000}
                    step={100000}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>₦500K</span>
                    <span>₦20M</span>
                  </div>
                </div>

                {/* Initial Deposit */}
                <div className="mb-6 md:mb-8">
                  <div className="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-mono text-xs font-bold sm:text-sm">Initial Deposit (Min. 20%)</p>
                    <span className="border-2 border-foreground bg-muted px-2 py-1 font-mono text-base font-black sm:px-3 sm:text-lg">
                      {depositPercent}% — {formatCurrency(deposit)}
                    </span>
                  </div>
                  <Slider
                    value={[depositPercent]}
                    onValueChange={(value) => setDepositPercent(value[0])}
                    min={20}
                    max={100}
                    step={5}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>20%</span>
                    <span>100% (Pay in Full)</span>
                  </div>
                </div>

                {/* Payment Type Toggle */}
                <div className="mb-6">
                  <p className="mb-4 block font-mono text-sm font-bold">How do you want to pay?</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentType("outright")}
                      className={`border-3 border-foreground p-4 font-mono font-bold transition-all ${
                        paymentType === "outright"
                          ? "bg-primary text-primary-foreground shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
                          : "bg-background shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {paymentType === "outright" && <Sparkles className="h-4 w-4" />}
                        Pay in Full
                      </div>
                      <p className="mt-1 text-xs font-normal opacity-80">Best value — no interest</p>
                    </button>
                    <button
                      onClick={() => setPaymentType("installment")}
                      className={`border-3 border-foreground p-4 font-mono font-bold transition-all ${
                        paymentType === "installment"
                          ? "bg-primary text-primary-foreground shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
                          : "bg-background shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"
                      }`}
                    >
                      <div>Installments</div>
                      <p className="mt-1 text-xs font-normal opacity-80">Spread over 3-12 months</p>
                    </button>
                  </div>
                </div>

                {/* Duration (only for installment) */}
                {paymentType === "installment" && (
                  <div>
                    <p className="mb-4 block font-mono text-sm font-bold">Payment Duration</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[3, 6, 12].map((months) => (
                        <button
                          key={months}
                          onClick={() => setDuration(months)}
                          className={`border-3 border-foreground p-4 font-mono font-bold transition-all ${
                            duration === months
                              ? "bg-primary text-primary-foreground shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
                              : "bg-background shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"
                          }`}
                        >
                          {months} Months
                          <p className="mt-1 text-xs font-normal opacity-80">
                            {(INTEREST_TIERS[months] * 100).toFixed(0)}% interest
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Info Box */}
              <div className="border-3 border-foreground bg-accent/30 p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                <div className="flex gap-4">
                  <Info className="h-6 w-6 shrink-0" />
                  <div>
                    <h3 className="mb-2 font-mono font-bold">How it works</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 mt-0.5 shrink-0" />
                        <span>We pay your landlord the full annual rent upfront</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 mt-0.5 shrink-0" />
                        <span>Pay in full to save on interest, or spread over installments</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 mt-0.5 shrink-0" />
                        <span>Minimum 20% deposit required</span>
                      </li>
                    </ul>
                    <div className="mt-4 flex items-start gap-2 border-t border-foreground/20 pt-4">
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        <strong>Note:</strong> Inspection fee, agreement fee, commission and initial deposit are paid separately by you
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="border-3 border-foreground bg-card p-6 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-mono text-xl font-bold">Payment Summary</h2>
                  {paymentType === "outright" && (
                    <Badge className="border-2 border-foreground bg-secondary font-bold">
                      <Sparkles className="mr-1 h-3 w-3" />
                      Best Value
                    </Badge>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b-2 border-dashed border-foreground/30 pb-4">
                    <span className="text-muted-foreground">Annual Rent</span>
                    <span className="font-mono font-bold">{formatCurrency(annualRent)}</span>
                  </div>
                  {deposit > 0 && (
                    <div className="flex items-center justify-between border-b-2 border-dashed border-foreground/30 pb-4">
                      <span className="text-muted-foreground">Your Deposit (paid upfront)</span>
                      <span className="font-mono font-bold text-secondary">-{formatCurrency(deposit)}</span>
                    </div>
                  )}

                  {paymentType === "installment" && (
                    <>
                      <div className="flex items-center justify-between border-b-2 border-dashed border-foreground/30 pb-4">
                        <span className="text-muted-foreground">Interest ({(interestRate * 100).toFixed(0)}%)</span>
                        <span className="font-mono font-bold">{formatCurrency(interestAmount)}</span>
                      </div>
                      <div className="flex items-center justify-between border-b-2 border-foreground pb-4">
                        <span className="font-mono font-bold">Total Repayment</span>
                        <span className="font-mono text-xl font-black">{formatCurrency(totalRepayment)}</span>
                      </div>
                    </>
                  )}

                  {paymentType === "outright" && (
                    <div className="flex items-center justify-between border-b-2 border-foreground pb-4">
                      <span className="font-mono font-bold">Total to Pay</span>
                      <span className="font-mono text-xl font-black">{formatCurrency(outrightTotal)}</span>
                    </div>
                  )}
                </div>

                {/* Monthly/Single Payment */}
                {paymentType === "installment" ? (
                  <div className="mt-4 border-3 border-foreground bg-primary/10 p-4 md:mt-6 md:p-6">
                    <p className="mb-1 text-xs text-muted-foreground sm:text-sm">Your Monthly Payment</p>
                    <p className="font-mono text-2xl font-black text-primary sm:text-3xl md:text-4xl lg:text-5xl">
                      {formatCurrency(monthlyPayment)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground sm:mt-2 sm:text-sm">for {duration} months</p>
                  </div>
                ) : (
                  <div className="mt-4 border-3 border-foreground bg-primary/10 p-4 md:mt-6 md:p-6">
                    <p className="mb-1 text-xs text-muted-foreground sm:text-sm">Balance Due After Deposit</p>
                    <p className="font-mono text-2xl font-black text-primary sm:text-3xl md:text-4xl lg:text-5xl">
                      {formatCurrency(outrightBalance)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground sm:mt-2 sm:text-sm">one-time payment</p>
                  </div>
                )}

                {/* Savings Callout */}
                {paymentType === "outright" && savingsVsInstallment > 0 && (
                  <div className="mt-4 border-2 border-secondary bg-secondary/10 p-3 text-center">
                    <p className="text-sm font-bold text-secondary">
                      Save {formatCurrency(savingsVsInstallment)} vs 12-month installments
                    </p>
                  </div>
                )}

                <div className="mt-6">
                  <Link href={`/dashboard/tenant/application?amount=${annualRent}&deposit=${deposit}&duration=${paymentType === "outright" ? 0 : duration}&paymentType=${paymentType}`}>
                    <Button className="w-full border-3 border-foreground bg-primary px-8 py-6 text-lg font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
                      Apply Now
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Payment Schedule (installment only) */}
              {paymentType === "installment" && (
                <div className="border-3 border-foreground bg-card p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                  <h3 className="mb-4 font-mono text-lg font-bold">Payment Schedule</h3>
                  <div className="max-h-64 overflow-y-auto">
                    <div className="space-y-2">
                      {paymentSchedule.map((payment) => (
                        <div
                          key={payment.month}
                          className="flex items-center justify-between border-b border-foreground/10 py-2 last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center border-2 border-foreground bg-muted font-mono text-sm font-bold">
                              {payment.month}
                            </span>
                            <span className="text-sm text-muted-foreground">{payment.date}</span>
                          </div>
                          <span className="font-mono font-bold">{formatCurrency(payment.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Comparison Card */}
              {paymentType === "outright" && (
                <div className="border-3 border-foreground bg-card p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                  <h3 className="mb-4 font-mono text-lg font-bold">Compare with Installments</h3>
                  <div className="space-y-3">
                    {[3, 6, 12].map((months) => {
                      const rate = INTEREST_TIERS[months]
                      const instInterest = Math.round(financedAmount * rate)
                      const instTotal = financedAmount + instInterest
                      const instMonthly = Math.round((instTotal / months) * 100) / 100

                      return (
                        <div
                          key={months}
                          className="flex items-center justify-between border-2 border-foreground p-3"
                        >
                          <div>
                            <p className="font-bold">{months} months</p>
                            <p className="text-xs text-muted-foreground">
                              {(rate * 100).toFixed(0)}% interest
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-mono font-bold">{formatCurrency(instMonthly)}/mo</p>
                            <p className="text-xs text-muted-foreground">
                              Total: {formatCurrency(instTotal)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
