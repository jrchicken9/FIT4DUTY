export type ApplicationStep = {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  tips: string[];
  estimatedTime: string;
  resources: {
    title: string;
    url: string;
  }[];
  nextSteps: string[];
};

const applicationSteps: ApplicationStep[] = [
  {
    id: "oacp-certificate",
    title: "OACP Certificate",
    description: "The Ontario Association of Chiefs of Police (OACP) Certificate is a requirement for most police services in Ontario. It consists of several assessments including a written test, physical test, and more.",
    requirements: [
      "Be at least 18 years of age",
      "Be a Canadian citizen or permanent resident",
      "Have a valid driver's license",
      "Have completed high school or equivalent",
      "Have no criminal convictions for which a pardon has not been granted",
    ],
    tips: [
      "Apply for the OACP Certificate well in advance of applying to police services",
      "Prepare thoroughly for each component of the certificate process",
      "Keep all documentation organized and accessible",
    ],
    estimatedTime: "2-3 months",
    resources: [
      {
        title: "OACP Official Website",
        url: "https://www.oacp.ca/",
      },
      {
        title: "OACP Certificate Application",
        url: "https://www.oacpcertificate.ca/",
      },
    ],
    nextSteps: ["prep-test", "ats-testing"],
  },
  {
    id: "prep-test",
    title: "PREP Test",
    description: "The Physical Readiness Evaluation for Police (PREP) test assesses your physical abilities required for police work. It includes a shuttle run, push/pull machine, and obstacle course.",
    requirements: [
      "Complete the shuttle run to level 6.5",
      "Complete the push/pull machine (70 lbs force)",
      "Complete the obstacle course in under 2:42",
      "Wear appropriate athletic clothing and footwear",
    ],
    tips: [
      "Train specifically for each component of the PREP test",
      "Practice the obstacle course layout if possible",
      "Focus on both strength and cardiovascular endurance",
      "Get plenty of rest before the test day",
    ],
    estimatedTime: "Test takes approximately 20-30 minutes",
    resources: [
      {
        title: "PREP Test Overview",
        url: "https://www.oacpcertificate.ca/physical-test/",
      },
      {
        title: "PREP Test Training Guide",
        url: "https://www.oacpcertificate.ca/wp-content/uploads/2020/01/PREP-Applicant-Preparation-Guide.pdf",
      },
    ],
    nextSteps: ["ats-testing", "application-submission"],
  },
  {
    id: "ats-testing",
    title: "ATS Testing",
    description: "The Applicant Testing Service (ATS) includes written tests to assess your cognitive abilities, behavioral characteristics, and written communication skills.",
    requirements: [
      "Register for ATS testing through the OACP Certificate process",
      "Bring required identification documents",
      "Complete all sections of the test",
    ],
    tips: [
      "Study general knowledge, math, and writing skills",
      "Practice time management for test sections",
      "Get a good night's sleep before the test",
      "Arrive early to reduce stress",
    ],
    estimatedTime: "3-4 hours",
    resources: [
      {
        title: "ATS Testing Information",
        url: "https://www.oacpcertificate.ca/written-test/",
      },
      {
        title: "Sample Questions",
        url: "https://www.oacpcertificate.ca/wp-content/uploads/2020/01/ATS-Sample-Questions.pdf",
      },
    ],
    nextSteps: ["application-submission", "interview-preparation"],
  },
  {
    id: "application-submission",
    title: "Application Submission",
    description: "Submit your application to your chosen police service(s) along with your OACP Certificate and other required documentation.",
    requirements: [
      "Completed application form",
      "OACP Certificate",
      "Resume and cover letter",
      "Educational transcripts",
      "References",
      "Driver's abstract",
      "First Aid/CPR certification (if required)",
    ],
    tips: [
      "Apply to multiple police services to increase your chances",
      "Tailor your resume and cover letter to each service",
      "Follow up on your application after submission",
      "Keep copies of all submitted documents",
    ],
    estimatedTime: "Varies by service (typically 1-2 weeks for preparation)",
    resources: [
      {
        title: "Ontario Provincial Police Careers",
        url: "https://www.opp.ca/index.php?id=115",
      },
      {
        title: "Toronto Police Service Careers",
        url: "https://www.torontopolice.on.ca/careers/",
      },
    ],
    nextSteps: ["interview-preparation", "background-check"],
  },
  {
    id: "interview-preparation",
    title: "Interview Preparation",
    description: "Prepare for the police interview, which typically includes behavioral questions, scenario-based questions, and questions about your understanding of policing.",
    requirements: [
      "Professional attire",
      "Knowledge of the police service",
      "Understanding of policing principles",
      "Prepared answers to common questions",
    ],
    tips: [
      "Research the specific police service thoroughly",
      "Practice with mock interviews",
      "Prepare examples of your relevant experiences",
      "Be honest and authentic in your responses",
      "Demonstrate your commitment to public service",
    ],
    estimatedTime: "2-3 weeks of preparation",
    resources: [
      {
        title: "Common Police Interview Questions",
        url: "https://www.policeprep.com/Police-Interview-Questions.html",
      },
      {
        title: "Interview Preparation Guide",
        url: "https://www.how2become.com/careers/police-officer-interview/",
      },
    ],
    nextSteps: ["background-check", "medical-psychological"],
  },
  {
    id: "background-check",
    title: "Background Check",
    description: "A thorough investigation of your background, including criminal history, employment history, credit check, and reference checks.",
    requirements: [
      "Provide accurate information on all forms",
      "Disclose all required information honestly",
      "Provide contact information for references",
      "Consent to background investigation",
    ],
    tips: [
      "Be completely honest about your history",
      "Inform your references that they may be contacted",
      "Address any potential issues proactively",
      "Be patient as this process can take time",
    ],
    estimatedTime: "1-3 months",
    resources: [
      {
        title: "Background Check Information",
        url: "https://www.oacp.ca/en/careers/background-checks.aspx",
      },
    ],
    nextSteps: ["medical-psychological", "final-steps"],
  },
  {
    id: "medical-psychological",
    title: "Medical & Psychological Evaluation",
    description: "Medical examination and psychological assessment to ensure you're physically and mentally fit for police work.",
    requirements: [
      "Complete medical history forms",
      "Undergo physical examination",
      "Complete psychological testing",
      "Participate in psychological interview",
    ],
    tips: [
      "Be honest about your medical history",
      "Get adequate rest before assessments",
      "Answer psychological questions truthfully",
      "Understand that these evaluations are for your safety and others",
    ],
    estimatedTime: "1-2 days for assessments, 2-4 weeks for results",
    resources: [
      {
        title: "Police Psychological Evaluation Guide",
        url: "https://www.psychologytoday.com/ca/blog/cop-doc/201811/police-psychological-screening",
      },
    ],
    nextSteps: ["final-steps"],
  },
  {
    id: "final-steps",
    title: "Final Steps & Offer",
    description: "Final review of your application, potential job offer, and preparation for police college.",
    requirements: [
      "Successfully complete all previous steps",
      "Accept job offer if extended",
      "Prepare for police college training",
    ],
    tips: [
      "Respond promptly to any final requests for information",
      "Begin preparing physically and mentally for police college",
      "Organize your personal affairs before training begins",
      "Stay in touch with your recruitment contact",
    ],
    estimatedTime: "2-4 weeks",
    resources: [
      {
        title: "Ontario Police College",
        url: "https://www.opconline.ca/",
      },
    ],
    nextSteps: [],
  },
];

export default applicationSteps;