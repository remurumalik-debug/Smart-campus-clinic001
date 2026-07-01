interface FAQ {
  keywords: string[];
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    keywords: ["hours", "open", "time", "when", "closed", "schedule"],
    question: "What are the clinic hours?",
    answer: "The campus clinic is open **Monday to Friday from 8:00 AM to 5:00 PM**, and **Saturdays from 9:00 AM to 12:00 PM**. We are closed on Sundays and public holidays."
  },
  {
    keywords: ["appointment", "book", "schedule", "reschedule", "cancel"],
    question: "How do I book an appointment?",
    answer: "You can book an appointment by logging into your student account and visiting the **Book an Appointment** page. Select your department, doctor, preferred date and time, describe your symptoms, and confirm the booking. You can also view and cancel your appointments from the **My Appointments** page."
  },
  {
    keywords: ["cancel", "cancellation", "cancel appointment"],
    question: "How do I cancel an appointment?",
    answer: "Go to the **My Appointments** page from your student dashboard. Find the appointment you want to cancel and click the **Cancel** button. Cancellations must be made at least 24 hours before the scheduled time."
  },
  {
    keywords: ["emergency", "urgent", "emergency", "accident", "serious"],
    question: "What should I do in an emergency?",
    answer: "For **medical emergencies**, please call **Campus Security at 911** or visit the nearest hospital emergency room immediately. The campus clinic is not equipped for emergency care. For urgent but non-emergency concerns, you can walk in during clinic hours and we will prioritize your case."
  },
  {
    keywords: ["location", "where", "address", "find", "clinic location"],
    question: "Where is the campus clinic located?",
    answer: "The campus clinic is located on the **ground floor of the Student Services Building**, Room 101. You can find it next to the main cafeteria."
  },
  {
    keywords: ["contact", "phone", "call", "email", "reach", "telephone", "number"],
    question: "How can I contact the clinic?",
    answer: "You can reach the campus clinic at:\n- **Phone:** (123) 456-7890\n- **Email:** clinic@campus.edu\n- **In person:** Student Services Building, Room 101\n\nYou can also use this chat assistant for general inquiries!"
  },
  {
    keywords: ["service", "service", "offer", "provide", "treatment", "available"],
    question: "What services does the clinic offer?",
    answer: "The campus clinic offers the following services:\n- General medical consultations\n- Pediatric care\n- Gynecological services\n- Cardiology consultations\n- Dermatology treatment\n- Orthopedic care\n- Eye examinations\n- ENT consultations\n- Dental services\n- Physiotherapy\n- Mental health counseling\n- Nutrition advice\n\nAll services are available to registered students at no additional cost."
  },
  {
    keywords: ["cost", "free", "fee", "price", "charge", "pay", "expensive", "insurance"],
    question: "Are clinic services free?",
    answer: "Yes, **all basic medical services at the campus clinic are free** for registered students. There are no consultation fees. However, if you need prescription medications, laboratory tests, or specialized treatments, there may be additional costs covered by your student health insurance."
  },
  {
    keywords: ["doctor", "physician", "specialist", "pediatrician", "cardio"],
    question: "What doctors are available?",
    answer: "We have several doctors available including:\n- Dr. John Smith - General Physician\n- Dr. Sarah Johnson - Pediatrician\n- Dr. Michael Brown - Cardiologist\n- Dr. Emily Davis - Dermatologist\n- Dr. James Wilson - Orthopedic Surgeon\n- Dr. Lisa Anderson - Gynecologist\n\nYou can select a doctor when booking your appointment online."
  },
  {
    keywords: ["walk", "walk-in", "walkin", "without appointment", "drop"],
    question: "Can I walk in without an appointment?",
    answer: "Yes, **walk-ins are welcome** during clinic hours. However, patients with appointments will be prioritized. If you walk in, you may experience longer wait times. We recommend booking an appointment online for a guaranteed time slot."
  },
  {
    keywords: ["prescription", "medicine", "medication", "drug", "pharmacy"],
    question: "How do I get a prescription refill?",
    answer: "To get a prescription refill, you need to schedule an appointment with a doctor. The doctor will review your condition and issue a new prescription if appropriate. Please bring your current prescription bottle and any relevant medical records to your appointment."
  },
  {
    keywords: ["test", "lab", "laboratory", "blood", "xray", "x-ray", "result"],
    question: "Does the clinic offer lab tests?",
    answer: "Yes, we offer basic laboratory services including blood tests, urine analysis, and rapid diagnostic tests. Results are typically available within 24-48 hours. Your doctor will inform you if any lab work is needed and explain how to access your results."
  },
  {
    keywords: ["referral", "specialist", "outside", "hospital", "off-campus"],
    question: "What if I need to see a specialist outside the clinic?",
    answer: "If our doctors determine that you need specialized care beyond what we offer, they will provide you with a **referral** to an off-campus specialist or hospital. The referral will include your medical notes and any relevant test results. Check with your insurance about coverage for off-campus referrals."
  },
  {
    keywords: ["mental", "counseling", "therapy", "psychologist", "psychiatrist", "depression", "anxiety", "stress"],
    question: "Does the clinic offer mental health services?",
    answer: "Yes, the campus clinic provides **mental health counseling services**. Our psychiatry department can help with anxiety, depression, stress management, and other mental health concerns. Appointments are confidential. You can book directly through the appointment system or walk in for urgent concerns."
  },
  {
    keywords: ["vaccine", "vaccination", "shot", "immunization", "flu", "covid"],
    question: "Does the clinic offer vaccinations?",
    answer: "Yes, we offer routine vaccinations including **flu shots, COVID-19 vaccines, and other standard immunizations**. Vaccination drives are announced via campus email and posted on the clinic notice board. You can also request a vaccination during a regular appointment."
  },
  {
    keywords: ["record", "medical record", "history", "document", "file"],
    question: "How do I access my medical records?",
    answer: "You can request your medical records by visiting the clinic in person or by emailing clinic@campus.edu. Please allow 3-5 business days for processing. All medical records are kept confidential in accordance with privacy regulations."
  },
  {
    keywords: ["confidential", "privacy", "private", "secret"],
    question: "Are my medical visits confidential?",
    answer: "Yes, **all medical consultations and records are strictly confidential**. Your information will not be shared with anyone outside the clinic without your written consent, except as required by law. This includes confidentiality from faculty, parents, and other students."
  },
  {
    keywords: ["password", "forgot", "reset", "login", "account"],
    question: "I forgot my password. How do I reset it?",
    answer: "On the login page, click the link to reset your password. If you're having trouble, please contact the campus IT support or visit the clinic front desk for assistance with your account."
  },
  {
    keywords: ["registration", "register", "signup", "sign up", "create account", "new student"],
    question: "How do I register for a clinic account?",
    answer: "To register, go to the **Register** page and fill in your details including your name, email, student ID, and password. Once registered, you can log in and start booking appointments right away."
  },
  {
    keywords: ["symptom", "symptoms", "sick", "ill", "pain", "fever", "cough", "cold", "flu", "headache", "infection"],
    question: "What should I do if I feel sick?",
    answer: "If you're feeling unwell, book an appointment with the campus clinic through the **Book an Appointment** page. Describe your symptoms when booking so the doctor can prepare. For mild symptoms like cold or headache, you can also visit the pharmacy for over-the-counter medication. If symptoms are severe, please visit the emergency room."
  },
  {
    keywords: ["insurance", "health insurance", "cover", "coverage", "claim"],
    question: "Does my student health insurance cover clinic visits?",
    answer: "Yes, all registered students are covered by the **student health insurance plan**. Basic consultations and treatments at the campus clinic are fully covered. Some specialized services, lab tests, or prescription medications may have additional costs. Check with the clinic reception for details about your specific coverage."
  },
  {
    keywords: ["specialist", "specialty", "specialization", "ent", "eye", "dental", "cardiology", "orthopedic", "gynecology", "dermatology", "physiotherapy"],
    question: "What specialist services are available?",
    answer: "The clinic offers a wide range of specialist services including **Cardiology, Dermatology, Orthopedics, Gynecology, ENT (Ear, Nose & Throat), Ophthalmology (Eye), Dental care, and Physiotherapy**. Appointments with specialists can be booked through the online system. Some specialists may have limited days, so please check availability in advance."
  },
  {
    keywords: ["phone", "call", "contact", "number", "telephone", "reach", "hotline"],
    question: "How do I contact the clinic by phone?",
    answer: "You can call the campus clinic at **(123) 456-7890** during operating hours. For after-hours emergencies, please call **Campus Security at 911** or proceed to the nearest hospital emergency room."
  },
  {
    keywords: ["telemedicine", "online", "virtual", "remote", "video", "telehealth", "online consultation"],
    question: "Does the clinic offer telemedicine / online consultations?",
    answer: "Currently, the campus clinic requires **in-person visits** for consultations. Online appointment booking is available, but the consultation itself must be conducted at the clinic. We are working on introducing telemedicine services in the future."
  },
  {
    keywords: ["late", "delay", "postpone", "reschedule", "rescheduling"],
    question: "I'm running late for my appointment. What should I do?",
    answer: "If you're running late, please call the clinic at (123) 456-7890 to let them know. If you arrive more than **15 minutes late**, your appointment may need to be rescheduled as it could affect other patients' slots. You can reschedule through the **My Appointments** page or by calling the clinic."
  },
  {
    keywords: ["parent", "guardian", "accompany", "minor", "under 18"],
    question: "Can I visit the clinic without a parent or guardian?",
    answer: "Yes, as a registered college student, you can visit the campus clinic independently. Your medical consultations and records are confidential and will not be shared with parents or guardians without your written consent."
  },
  {
    keywords: ["parking", "park", "transportation", "bus", "commute", "directions"],
    question: "Is parking available near the clinic?",
    answer: "Yes, there is **student parking available** in the lot adjacent to the Student Services Building. Parking is free for students with a valid campus parking permit. You can also access the clinic via the campus shuttle bus, which stops at the Student Services Building every 15 minutes."
  },
];

export function findFAQAnswer(message: string): { answer: string; matchedQuestion: string } | null {
  const lower = message.toLowerCase().replace(/[^\w\s]/g, "").trim();
  const words = lower.split(/\s+/).filter(w => w.length > 2);

  let bestMatch: { faq: FAQ; score: number } | null = null;

  for (const faq of faqs) {
    let score = 0;

    for (const kw of faq.keywords) {
      const kwLower = kw.toLowerCase();
      if (lower.includes(kwLower)) {
        score += kwLower.split(/\s+/).length * 2;
      }
    }

    for (const word of words) {
      for (const kw of faq.keywords) {
        const kwLower = kw.toLowerCase();
        if (kwLower.includes(word) || word.includes(kwLower)) {
          score += 1;
        }
      }
    }

    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { faq, score };
    }
  }

  if (bestMatch && bestMatch.score >= 2) {
    return { answer: bestMatch.faq.answer, matchedQuestion: bestMatch.faq.question };
  }

  const greetingMatch = /^(hi|hello|hey|good\s*(morning|afternoon|evening)|yo|sup)\b/i.test(lower);
  if (greetingMatch) {
    return {
      answer: "Hello! Welcome to the Campus Clinic Assistant. How can I help you today? You can ask me about clinic hours, appointment booking, services, or any other campus health questions.",
      matchedQuestion: "Greeting"
    };
  }

  const thanksMatch = /(thank|thanks|thx|appreciate)/i.test(lower);
  if (thanksMatch) {
    return {
      answer: "You're welcome! If you have any more questions, feel free to ask. Take care!",
      matchedQuestion: "Thanks"
    };
  }

  return null;
}
