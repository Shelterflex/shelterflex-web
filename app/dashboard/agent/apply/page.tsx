'use client'

import React, { useState } from "react";

import Link from 'next/link'
import { ArrowLeft, CheckCircle, Send, MapPin, Bed, Bath, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'

export default function AgentApplyPage() {
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [applicationSubmitted, setApplicationSubmitted] = useState(false)

  // Mock property data - in real app, would come from URL params or database
  const property = {
    id: 3,
    title: 'Spacious 4 Bedroom Duplex',
    location: 'Ikoyi, Lagos',
    price: 5500000,
    beds: 4,
    baths: 3,
    sqm: 220,
    landlord: { name: 'Chief Okonkwo', avatar: 'CO' },
    postedAt: '2 days ago',
  }

  const handleSubmit: React.ComponentProps<'form'>['onSubmit'] = (e) => {
    e.preventDefault()
    if (!agreeToTerms) return
    setApplicationSubmitted(true)
  }

  if (applicationSubmitted) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl">
            <Card className="border-3 border-foreground p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] text-center md:p-8">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center border-3 border-foreground bg-secondary">
                  <CheckCircle className="h-8 w-8" />
                </div>
              </div>
              <h1 className="mb-4 font-mono text-2xl font-black md:text-3xl">Application Submitted!</h1>
              <p className="mb-6 text-muted-foreground">Your application to manage <strong>{property.title}</strong> has been submitted successfully.</p>
              
              <div className="mb-6 border-3 border-foreground bg-muted p-4">
                <p className="text-sm font-bold mb-2">Application ID: APP-2024-001234</p>
                <p className="text-xs text-muted-foreground">You'll receive an email confirmation shortly. The landlord will review your application within 3-5 business days.</p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:justify-center md:gap-4">
                <Link href="/dashboard/agent/applications">
                  <Button className="w-full border-3 border-foreground bg-primary font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:w-auto">
                    View My Applications
                  </Button>
                </Link>
                <Link href="/dashboard/agent">
                  <Button variant="outline" className="w-full border-3 border-foreground bg-card font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:w-auto">
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="container mx-auto px-4">
        <Link href="/dashboard/agent" className="inline-flex items-center gap-2 text-sm font-bold mb-6 border-3 border-foreground p-2 hover:bg-muted">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="mx-auto max-w-3xl space-y-6">
          {/* Property Summary */}
          <Card className="border-3 border-foreground p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:p-6">
            <h2 className="mb-4 font-mono text-lg font-bold">Property Details</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold md:text-xl">{property.title}</h3>
                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {property.location}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 border-2 border-foreground bg-muted px-2 py-1 md:gap-2 md:px-3">
                  <Bed className="h-4 w-4" />
                  <span className="text-xs font-bold md:text-sm">{property.beds} Beds</span>
                </div>
                <div className="flex items-center gap-2 border-2 border-foreground bg-muted px-2 py-1 md:gap-2 md:px-3">
                  <Bath className="h-4 w-4" />
                  <span className="text-xs font-bold md:text-sm">{property.baths} Baths</span>
                </div>
                <div className="flex items-center gap-2 border-2 border-foreground bg-muted px-2 py-1 md:gap-2 md:px-3">
                  <Square className="h-4 w-4" />
                  <span className="text-xs font-bold md:text-sm">{property.sqm} m²</span>
                </div>
              </div>

              <div className="border-t-2 border-foreground pt-4">
                <p className="text-sm text-muted-foreground mb-1">Annual Rent</p>
                <p className="font-mono text-2xl font-black">₦{property.price.toLocaleString()}</p>
              </div>

              <div className="border-t-2 border-foreground pt-4">
                <p className="text-sm text-muted-foreground">Landlord</p>
                <p className="font-bold">{property.landlord.name}</p>
              </div>
            </div>
          </Card>

          {/* Application Form */}
          <Card className="border-3 border-foreground p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:p-6">
            <h2 className="mb-4 font-mono text-lg font-bold">Agent Information</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border-3 border-foreground bg-card p-4">
                <p className="text-sm text-muted-foreground mb-2">Your Details</p>
                <p className="font-bold">Adebayo Johnson</p>
                <p className="text-sm text-muted-foreground">adebayo@sheltaflex.com</p>
                <p className="text-sm text-muted-foreground">+234 (0) 802 123 4567</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold">Why should the landlord choose you?</h3>
                <textarea
                  placeholder="Tell the landlord about your experience, track record, and why you're the best fit for this property..."
                  defaultValue="I have 5+ years of experience managing premium properties in Ikoyi. I have successfully managed over 30 properties with 100% tenant satisfaction ratings."
                  rows={5}
                  className="w-full border-3 border-foreground p-3 font-mono text-sm shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
                />
              </div>

              <div className="space-y-3 border-3 border-foreground bg-muted p-4">
                <h3 className="font-bold">Commission Structure</h3>
                <p className="text-sm text-muted-foreground">
                  <strong>Inspection Fee:</strong> Vary by agent (paid by tenant)
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Management Commission:</strong> To be negotiated with landlord
                </p>
              </div>

              <div className="border-t-2 border-foreground pt-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={agreeToTerms}
                    onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                    className="mt-1"
                  />
                  <label htmlFor="terms" className="text-sm text-foreground cursor-pointer">
                    I confirm that the information provided is accurate and I agree to Sheltaflex&apos;s{' '}
                    <Link href="/terms-of-service" className="font-bold border-b-2 border-foreground hover:text-primary">
                      Terms of Service
                    </Link>
                    . I understand that providing false information may result in account suspension.
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                disabled={!agreeToTerms}
                className="w-full border-3 border-foreground bg-primary py-4 font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] disabled:opacity-50"
              >
                <Send className="mr-2 h-4 w-4" />
                Submit Application
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
