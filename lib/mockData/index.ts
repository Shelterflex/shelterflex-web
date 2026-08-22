// Re-export all mock data from this file for easy imports

// Homepage
export { homePageStats, homePageBenefits } from "./homepage";

// Properties
export { allProperties, propertyFilters } from "./properties";

// Landlords Page
export {
  landlordBenefits,
  landlordStats,
  landlordTestimonials,
} from "./landlordsPage";

// Lease
export { leaseDetails } from "./leaseData";

// Documents
export {
  leaseAgreement,
  propertyInspectionReport,
  paymentSchedule,
  houseRules,
} from "./documents";

// Tenant dashboard & payments
export {
  tenantWalletData,
  tenantPaymentSchedule,
  tenantPastPayments,
  tenantCurrentLease,
  tenantDashboardPaymentSchedule,
  tenantDashboardPastPayments,
  tenantSavedProperties,
  tenantApplicationProperties,
  tenantWhistleblowersToRate,
} from "./tenant";

// Landlord dashboard
export {
  landlordMyProperties,
  landlordDashboardStats,
  landlordProperties,
  landlordTenants,
  landlordPaymentHistory,
  propertyApplications,
  type Applicant,
} from "./landlord";

// Whistleblower
export {
  whistleblowerData,
  whistleblowerListings,
  whistleblowerEarnings,
} from "./whistleblower";

// Admin
export { whistleblowerApplications } from "./admin";

// Inspector
export {
  inspectorJobs,
  inspectorEarnings,
  inspectorStats,
  inspectionChecklistTemplate,
  type InspectorJob,
  type InspectorEarning,
  type InspectionType,
  type JobStatus,
  type PaymentStatus,
} from "./inspector";
