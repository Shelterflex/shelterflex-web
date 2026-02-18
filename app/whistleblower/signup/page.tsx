"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function WhistleblowerSignupPage() {
  const [currentStep, setCurrentStep] = useState<
    "info" | "verification" | "confirmation"
  >("info");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    linkedinProfile: "",
    facebookProfile: "",
    instagramProfile: "",
  });
  const [verificationStatus, setVerificationStatus] = useState<
    "pending" | "approved" | "rejected"
  >("pending");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStep1Submit = () => {
    if (
      formData.fullName &&
      formData.email &&
      formData.phone &&
      formData.address
    ) {
      setCurrentStep("verification");
    }
  };

  const handleVerificationSubmit = () => {
    if (
      formData.linkedinProfile &&
      formData.facebookProfile &&
      formData.instagramProfile
    ) {
      // Simulate verification check
      setVerificationStatus("approved");
      setCurrentStep("confirmation");
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-8 text-sm font-bold border-b-2 border-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="max-w-2xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8 flex items-center justify-between">
            <div
              className={`flex-1 border-3 border-foreground p-4 text-center font-bold transition-all ${currentStep === "info" ? "bg-primary" : "bg-card"}`}
            >
              Step 1: Your Info
            </div>
            <div className="w-4 border-t-3 border-foreground" />
            <div
              className={`flex-1 border-3 border-foreground p-4 text-center font-bold transition-all ${currentStep === "verification" ? "bg-primary" : "bg-card"}`}
            >
              Step 2: Verify Identity
            </div>
            <div className="w-4 border-t-3 border-foreground" />
            <div
              className={`flex-1 border-3 border-foreground p-4 text-center font-bold transition-all ${currentStep === "confirmation" ? "bg-primary" : "bg-card"}`}
            >
              Step 3: Confirm
            </div>
          </div>

          {/* Step 1: Basic Info */}
          {currentStep === "info" && (
            <Card className="border-3 border-foreground p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
              <h1 className="text-3xl font-black mb-2">
                Become a Whistleblower
              </h1>
              <p className="text-muted-foreground mb-6">
                Earn ₦10-20k by reporting vacant apartments in your building
              </p>

              <div className="space-y-4 mb-6">
                <div>
                  <label htmlFor="full-name" className="text-sm font-bold mb-2 block">
                    Full Name
                  </label>
                  <Input
                    id="full-name"
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="border-3 border-foreground py-3"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="text-sm font-bold mb-2 block">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    className="border-3 border-foreground py-3"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="text-sm font-bold mb-2 block">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+234..."
                    className="border-3 border-foreground py-3"
                  />
                </div>
                <div>
                  <label htmlFor="address" className="text-sm font-bold mb-2 block">
                    Current Address (Where you live)
                  </label>
                  <Input
                    id="address"
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="e.g., Block 5, Flat 2A, Yaba, Lagos"
                    className="border-3 border-foreground py-3"
                  />
                </div>
              </div>

              <Button
                onClick={handleStep1Submit}
                className="w-full border-3 border-foreground bg-primary px-6 py-6 font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"
              >
                Continue to Verification
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Card>
          )}

          {/* Step 2: Social Verification */}
          {currentStep === "verification" && (
            <Card className="border-3 border-foreground p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
              <h2 className="text-2xl font-black mb-2">Verify Your Identity</h2>
              <p className="text-muted-foreground mb-6">
                We check your social media to prevent fraud. This helps us
                ensure you're a real resident, not a career agent.
              </p>

              <div className="bg-yellow-100 border-3 border-yellow-600 p-4 mb-6 rounded-sm">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-yellow-900 mb-1">
                      Why we check social media:
                    </p>
                    <ul className="text-xs text-yellow-800 space-y-1">
                      <li>• Verify you have a real job (LinkedIn)</li>
                      <li>• Confirm you live where you say (location tags)</li>
                      <li>• Detect career agents infiltrating the system</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label htmlFor="linkedin-profile" className="text-sm font-bold mb-2 block">
                    LinkedIn Profile URL
                  </label>
                  <Input
                    id="linkedin-profile"
                    type="url"
                    name="linkedinProfile"
                    value={formData.linkedinProfile}
                    onChange={handleInputChange}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="border-3 border-foreground py-3"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Must show real job and education history
                  </p>
                </div>
                <div>
                  <label htmlFor="facebook-profile" className="text-sm font-bold mb-2 block">
                    Facebook Profile URL
                  </label>
                  <Input
                    id="facebook-profile"
                    type="url"
                    name="facebookProfile"
                    value={formData.facebookProfile}
                    onChange={handleInputChange}
                    placeholder="https://facebook.com/yourprofile"
                    className="border-3 border-foreground py-3"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Should have real friends and location check-ins
                  </p>
                </div>
                <div>
                  <label htmlFor="instagram-profile" className="text-sm font-bold mb-2 block">
                    Instagram Profile URL
                  </label>
                  <Input
                    id="instagram-profile"
                    type="url"
                    name="instagramProfile"
                    value={formData.instagramProfile}
                    onChange={handleInputChange}
                    placeholder="https://instagram.com/yourprofile"
                    className="border-3 border-foreground py-3"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Helps us verify you're a real person with a life
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setCurrentStep("info")}
                  variant="outline"
                  className="flex-1 border-3 border-foreground bg-transparent py-6 font-bold"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleVerificationSubmit}
                  className="flex-1 border-3 border-foreground bg-primary px-6 py-6 font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"
                >
                  Submit for Review
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </Card>
          )}

          {/* Step 3: Confirmation */}
          {currentStep === "confirmation" && (
            <Card className="border-3 border-foreground p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="flex h-16 w-16 items-center justify-center border-3 border-foreground bg-secondary">
                    <CheckCircle className="h-10 w-10" />
                  </div>
                </div>
                <h2 className="text-3xl font-black mb-2">
                  Application Submitted!
                </h2>
                <p className="text-muted-foreground mb-4">
                  We've received your whistleblower application. Our team will
                  verify your social media accounts and approve your profile
                  within 24-48 hours.
                </p>

                <div className="border-3 border-foreground bg-muted p-4 mb-6 space-y-3">
                  <div>
                    <p className="text-sm font-bold mb-1">What happens next:</p>
                    <ol className="text-sm text-left space-y-2">
                      <li className="flex gap-2">
                        <span className="font-bold">1.</span>
                        <span>Our team reviews your social media accounts</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold">2.</span>
                        <span>
                          We verify you live at the address you provided
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold">3.</span>
                        <span>
                          You'll receive an email confirmation and access to
                          your dashboard
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold">4.</span>
                        <span>
                          Start reporting vacant apartments and earning!
                        </span>
                      </li>
                    </ol>
                  </div>
                </div>

                <div className="bg-green-100 border-3 border-green-600 p-4 mb-6 rounded-sm">
                  <p className="text-sm font-bold text-green-900 mb-2">
                    Important Rules:
                  </p>
                  <ul className="text-xs text-green-800 space-y-1 text-left">
                    <li>
                      • Maximum 2 apartments per month (to prevent agent
                      infiltration)
                    </li>
                    <li>
                      • Must actually live in the building you're reporting from
                    </li>
                    <li>• Photos must be recent (we check metadata)</li>
                    <li>• Earn ₦10-20k per successful rental</li>
                  </ul>
                </div>

                <Link href="/whistleblower/dashboard">
                  <Button className="w-full border-3 border-foreground bg-primary px-6 py-6 font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
