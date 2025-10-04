export type FAQ = {
  id: string;
  question: string;
  answer: string;
  category: "Application" | "Fitness" | "Testing" | "Training" | "General";
};

const faqs: FAQ[] = [
  {
    id: "faq-1",
    question: "What is the PREP test and what does it involve?",
    answer: "The Physical Readiness Evaluation for Police (PREP) test is a standardized physical fitness assessment used by police services in Ontario. It consists of three main components: 1) A shuttle run (beep test) to assess aerobic fitness, 2) A push/pull machine that simulates controlling a resistant subject, and 3) An obstacle course that includes various physical tasks such as jumping, climbing, and a body drag. You must complete all components within specific time limits to pass.",
    category: "Fitness",
  },
  {
    id: "faq-2",
    question: "What are the minimum requirements to become a police officer in Ontario?",
    answer: "To become a police officer in Ontario, you must: 1) Be at least 18 years of age, 2) Be a Canadian citizen or permanent resident, 3) Have a high school diploma or equivalent, 4) Possess a valid driver's license with no serious violations, 5) Have no criminal convictions for which a pardon has not been granted, 6) Be of good moral character, 7) Be physically and mentally able to perform the duties of a police officer, and 8) Successfully complete the application process, including obtaining an OACP Certificate.",
    category: "Application",
  },
  {
    id: "faq-3",
    question: "How long does the entire police application process take?",
    answer: "The police application process in Ontario typically takes 6-12 months from initial application to job offer. This timeline can vary based on the specific police service, the number of applicants, your background check complexity, and how quickly you complete each stage of the process. It's advisable to begin preparing well in advance and to be patient throughout the process.",
    category: "Application",
  },
  {
    id: "faq-4",
    question: "What is the OACP Certificate and why do I need it?",
    answer: "The Ontario Association of Chiefs of Police (OACP) Certificate is Ontario's standardized pre-screening program for police applicants. It costs $250 CAD and includes Part A (admin forms, fitness log, medical examination), Part B (SSPO cognitive assessment), and Part C (PRF-R personality assessment). The certificate is valid for 12 months from issue date, with re-testing available after 10 months. Testing is done online with live proctoring via eProctor Canada. You have 6 months from purchase to complete all components and must register your proctor account within 24 hours of receiving the email.",
    category: "Application",
  },
  {
    id: "faq-5",
    question: "How should I prepare for the police interview?",
    answer: "To prepare for a police interview: 1) Research the specific police service thoroughly, 2) Understand current policing issues and community concerns, 3) Practice answering behavioral and scenario-based questions, 4) Prepare examples that demonstrate your integrity, problem-solving abilities, and communication skills, 5) Dress professionally, 6) Be prepared to discuss why you want to be a police officer and why you're interested in that specific service, and 7) Practice mock interviews with someone who can provide feedback.",
    category: "Application",
  },
  {
    id: "faq-6",
    question: "What fitness level do I need to pass the PREP test?",
    answer: "To pass the PREP test, you need: 1) Sufficient aerobic fitness to reach at least level 6.5 on the shuttle run, 2) Upper and lower body strength to generate and maintain 70-80 pounds of force on the push/pull machine, 3) Agility, coordination, and anaerobic endurance to complete the obstacle course in under 2:42, and 4) Overall physical conditioning to complete all components with minimal rest between them. Regular training that includes cardio, strength training, and circuit workouts is recommended.",
    category: "Fitness",
  },
  {
    id: "faq-7",
    question: "What happens during the background check?",
    answer: "The police background check is thorough and includes: 1) Verification of your employment history, education, and residences, 2) Criminal record check, 3) Credit history review, 4) Interviews with references, neighbors, former employers, and associates, 5) Social media review, 6) Driving record check, and 7) Verification of all information provided in your application. Be completely honest in your application, as any discrepancies or omissions can disqualify you regardless of the severity of the issue.",
    category: "Application",
  },
  {
    id: "faq-8",
    question: "How can I improve my beep test performance?",
    answer: "To improve your beep test performance: 1) Practice the actual beep test protocol regularly, 2) Incorporate interval training (e.g., 30 seconds sprint, 30 seconds rest) into your workouts, 3) Build aerobic endurance with longer runs (30+ minutes) 2-3 times per week, 4) Work on quick turns and acceleration, 5) Improve your running economy through proper form, 6) Gradually increase training intensity over time, and 7) Ensure proper nutrition and hydration before testing. Aim to reach at least level 7-8 in training to have a buffer during the actual test.",
    category: "Training",
  },
  {
    id: "faq-9",
    question: "What should I expect at the Ontario Police College?",
    answer: "At the Ontario Police College (OPC), expect: 1) A 12-13 week residential basic training program, 2) Intensive physical training and fitness assessments, 3) Academic courses on law, procedures, and police techniques, 4) Firearms and defensive tactics training, 5) Scenario-based training, 6) Regular testing and evaluations, 7) Strict discipline and professional standards, and 8) Long days with both physical and mental challenges. After OPC, you'll typically complete additional training with your specific police service.",
    category: "Training",
  },
  {
    id: "faq-10",
    question: "Can I apply to multiple police services at the same time?",
    answer: "Yes, you can and should apply to multiple police services simultaneously. With an OACP Certificate, you can apply to any participating Ontario police service within the certificate's 12-month validity period. Each service has its own hiring process and timeline, so applying to multiple services increases your chances of being hired sooner. Just be sure to keep track of where you've applied and the status of each application.",
    category: "Application",
  },
];

export default faqs;