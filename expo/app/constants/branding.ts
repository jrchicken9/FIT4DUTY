// app/constants/branding.ts
const APP_NAME = "FIT4Duty";

export const BRAND = {
  name: APP_NAME,

  // Short, welcome-screen friendly
  taglineShort: "Bridging Graduation to Career in Policing",

  // Slightly longer; good for dashboard subhead and store listings
  taglineExtended:
    "From graduation to badge — preparation for every police applicant, whether you're fresh out of school or changing careers.",

  // Mission for onboarding / About
  mission: [
    "FIT4Duty is built for all aspiring police officers — from recent college and high school graduates to those transitioning from other careers.",
    "Graduation alone doesn't make you a police officer. There's a gap between finishing school (or leaving another career) and being hired: prerequisites, testing, fitness, applications, interviews, and background checks.",
    "FIT4Duty bridges that gap with structured preparation, realistic practice tools, and guidance to help every applicant move confidently from civilian to sworn officer."
  ].join(" "),

  // Audience note (optional microcopy where space is tight)
  audienceNote:
    "Primary audience: recent college grads (e.g., Police Foundations, Criminology, Justice Studies). Also supports mature career-changers and applicants applying directly from high school.",

  // Exported convenience helpers
  fullTitle: `${APP_NAME} — Police Applicant Preparation`,
  mainTitle: "Police Applicant Preparation",
};
