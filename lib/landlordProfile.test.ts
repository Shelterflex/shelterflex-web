import { describe, expect, it } from "vitest";
import { hasLandlordProfile, type LandlordSettings } from "./landlordApi";

function settings(phone: string, address: string): LandlordSettings {
  return {
    profile: { fullName: "A", email: "a@b.co", companyName: "", phone, address },
    notifications: { newInquiries: true, paymentUpdates: true, propertyViews: false, marketingTips: false },
    payout: { bankName: "", accountNumber: "", accountName: "" },
  };
}

describe("hasLandlordProfile", () => {
  it("needs both a phone and an address", () => {
    expect(hasLandlordProfile(settings("+2348012345678", "Lekki, Lagos"))).toBe(true);
    expect(hasLandlordProfile(settings("", "Lekki, Lagos"))).toBe(false);
    expect(hasLandlordProfile(settings("+2348012345678", "  "))).toBe(false);
  });
});
