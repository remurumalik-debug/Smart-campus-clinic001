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
    keywords: ["department", "departments", "units", "clinic departments"],
    question: "What departments does the clinic have?",
    answer: "The campus clinic has the following departments:\n- **General Medicine** — common illnesses, check-ups & general health\n- **Pediatrics** — medical care for children & teens\n- **Obstetrics & Gynecology (OB/GYN)** — women's reproductive health\n- **General Surgery** — surgical procedures & wound care\n- **Orthopedics** — bones, joints & muscles\n- **Cardiology** — heart & blood pressure\n- **Neurology** — brain & nervous system\n- **Dermatology** — skin, hair & nails\n- **Ophthalmology** — eye care\n- **Ear, Nose & Throat (ENT)** — ear, nose & throat conditions\n- **Psychiatry** — mental health & counseling\n- **Emergency Medicine** — urgent care\n\nAsk me about a specific department, like \"what does the cardiology department do?\", and I'll explain what it handles. You can also book an appointment in any department right here in the chat."
  },
  {
    keywords: ["service", "service", "offer", "provide", "treatment", "available"],
    question: "What services does the clinic offer?",
    answer: "The campus clinic offers the following services:\n- General medical consultations\n- Pediatric care\n- Gynecological services\n- Cardiology consultations\n- Dermatology treatment\n- Orthopedic care\n- Eye examinations\n- ENT consultations\n- Dental services\n- Physiotherapy\n- Mental health counseling\n- Nutrition advice\n\nAll services are available to registered students at no additional cost. You can book an appointment for any of these through the chat assistant."
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
  {
    keywords: ["headache", "migraine", "head pain", "throbbing"],
    question: "What can I do for a headache?",
    answer: "For common headaches, you can try resting in a quiet, dark room, staying hydrated, and using over-the-counter pain relievers like acetaminophen or ibuprofen. If headaches are frequent, severe, or accompanied by vision changes, nausea, or stiff neck, please **book an appointment** for a medical evaluation."
  },
  {
    keywords: ["fever", "temperature", "hot", "chills", "sweating"],
    question: "What should I do if I have a fever?",
    answer: "If you have a fever (temperature above 100.4°F / 38°C), rest and stay hydrated. You can take acetaminophen or ibuprofen to reduce the fever. **Visit the clinic** if the fever persists more than 3 days, is very high (above 103°F), or is accompanied by severe headache, rash, difficulty breathing, or confusion."
  },
  {
    keywords: ["cold", "cough", "sore throat", "runny nose", "congestion", "flu", "influenza"],
    question: "How do I treat a cold or flu?",
    answer: "For colds and flu, rest, drink plenty of fluids, and take over-the-counter medications for symptom relief. **Come to the clinic** if you have a high fever, difficulty breathing, symptoms lasting more than 10 days, or if you're at high risk for complications. We offer flu vaccinations during flu season."
  },
  {
    keywords: ["allergy", "allergic", "hay fever", "pollen", "dust", "seasonal"],
    question: "How can I manage my allergies?",
    answer: "For seasonal allergies, over-the-counter antihistamines (like cetirizine or loratadine) and nasal sprays can help. Avoid triggers by keeping windows closed during high pollen days and showering after being outdoors. **Book an appointment** if your allergies are severe or not responding to over-the-counter treatments."
  },
  {
    keywords: ["stomach", "nausea", "vomit", "diarrhea", "food poisoning", "upset stomach", "abdominal", "cramp"],
    question: "What helps with stomach issues?",
    answer: "For mild stomach upset, try the **BRAT diet** (bananas, rice, applesauce, toast), stay hydrated with clear fluids, and avoid spicy or fatty foods. **Seek medical attention** if you have severe abdominal pain, bloody stools, persistent vomiting, fever above 102°F, or symptoms lasting more than 48 hours."
  },
  {
    keywords: ["injury", "sprain", "strain", "swelling", "bruise", "twisted", "ankle", "wrist"],
    question: "How do I treat a sprain or strain?",
    answer: "Follow the **RICE** method: Rest the injured area, apply Ice for 15-20 minutes every 2-3 hours, use Compression with an elastic bandage, and Elevate the injury above heart level. Take over-the-counter pain relievers if needed. **Visit the clinic** if you can't bear weight, have severe swelling, or if symptoms don't improve after 48 hours."
  },
  {
    keywords: ["skin", "rash", "itch", "hives", "eczema", "dermatitis", "irritation"],
    question: "What should I do for a skin rash?",
    answer: "For mild rashes, keep the area clean and dry, avoid scratching, and apply an over-the-counter hydrocortisone cream. **Book an appointment** if the rash is spreading, painful, accompanied by fever, or if you suspect an allergic reaction. Our dermatology department can evaluate and treat persistent skin conditions."
  },
  {
    keywords: ["sore throat", "strep", "tonsillitis", "swallowing", "throat pain"],
    question: "How do I know if my sore throat needs a doctor?",
    answer: "Mild sore throats often improve with warm salt water gargles, honey in tea, and throat lozenges. **Visit the clinic** if you have a severe sore throat with fever, swollen lymph nodes, white patches on tonsils, or difficulty swallowing — these may indicate strep throat which requires antibiotic treatment."
  },
  {
    keywords: ["ear", "earache", "ear pain", "hearing", "infection ear"],
    question: "What can I do for an earache?",
    answer: "For mild ear discomfort, apply a warm compress to the affected ear and take over-the-counter pain relievers. **Do not** insert anything into the ear canal. **Book an appointment** if you have severe pain, fever, hearing loss, or fluid discharge from the ear."
  },
  {
    keywords: ["eye", "eye infection", "pink eye", "conjunctivitis", "red eye", "sticky eye"],
    question: "What should I do for an eye infection?",
    answer: "If you have red, itchy, or sticky eyes, avoid touching or rubbing them, wash your hands frequently, and don't share towels or pillows. **Visit the clinic** for proper diagnosis — bacterial conjunctivitis requires antibiotic eye drops, while viral cases need different treatment. Our ophthalmology department can help."
  },
  {
    keywords: ["insomnia", "sleep", "can't sleep", "tired", "fatigue", "exhaustion"],
    question: "How can I improve my sleep?",
    answer: "Practice good **sleep hygiene**: maintain a consistent sleep schedule, avoid screens 30 minutes before bed, limit caffeine after 2 PM, create a cool dark sleeping environment, and avoid heavy meals before bedtime. **Book a consultation** if you have persistent insomnia, excessive daytime sleepiness, or your fatigue is affecting your studies."
  },
  {
    keywords: ["stress", "anxiety", "worry", "nervous", "panic", "overwhelmed", "pressure"],
    question: "How can I manage stress and anxiety?",
    answer: "To manage stress, try deep breathing exercises, regular physical activity, adequate sleep, and taking breaks from studying. The clinic offers **mental health counseling services** — you can book a confidential appointment with our psychiatry department. For immediate crisis support, contact campus counseling services."
  },
  {
    keywords: ["dental", "tooth", "toothache", "gum", "mouth", "oral"],
    question: "What can I do for a toothache?",
    answer: "Rinse your mouth with warm salt water, use dental floss to remove any trapped food, and take over-the-counter pain relievers. Avoid very hot or cold foods. **Book an appointment** with our dental department if pain persists, you have swelling, fever, or signs of infection."
  },
  {
    keywords: ["weight", "diet", "nutrition", "meal", "eating", "healthy eating", "dietary"],
    question: "Can the clinic help with nutrition and diet advice?",
    answer: "Yes! Our **Nutrition department** offers dietary consultations for healthy eating, weight management, and special dietary needs. Book an appointment to speak with a nutrition specialist who can create a personalized plan for your health goals."
  },
  {
    keywords: ["physiotherapy", "physio", "physical therapy", "rehab", "rehabilitation", "back pain", "neck pain"],
    question: "How can physiotherapy help me?",
    answer: "Our **Physiotherapy department** treats musculoskeletal issues including back pain, neck pain, sports injuries, and post-surgery rehabilitation. A physiotherapist will assess your condition and create an exercise program to improve mobility, strength, and reduce pain. Book an appointment online."
  },
  {
    keywords: ["menstrual", "period", "cramps", "pms", "menstruation", "cycle"],
    question: "How can I manage period pain?",
    answer: "For menstrual cramps, try over-the-counter pain relievers (ibuprofen works well), apply a heating pad to your lower abdomen, exercise lightly, and rest. **Book an appointment** with our gynecology department if you have severe pain, irregular cycles, or heavy bleeding that affects your daily activities."
  },
];

export function findFAQAnswer(message: string): { answer: string; matchedQuestion: string } | null {
  const lower = message.toLowerCase().replace(/[^\w\s]/g, "").trim();
  const words = lower.split(/\s+/).filter((w) => w.length > 2);

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

  const symptomMatch = /(fever|headache|cold|flu|cough|sore throat|rash|pain|stomach|nausea|vomit|diarrhea|allergy|injury|sprain|eye|ear|tooth|sleep|stress|anxiety|depression|dizzy|dizziness|wound|swelling|migraine)/i.test(lower);
  const greetingMatch = /^(hi|hello|hey|good\s*(morning|afternoon|evening)|yo|sup)\b/i.test(lower);
  if (greetingMatch) {
    return {
      answer: "Hello! Welcome to the Campus Clinic Assistant. How can I help you today? You can ask me about clinic hours, appointment booking, services, or any other campus health questions.",
      matchedQuestion: "Greeting"
    };
  }

  if (symptomMatch) {
    return {
      answer: "I can offer general wellness guidance, but I’m not a doctor. For common concerns, rest, stay hydrated, and avoid self-medicating beyond safe over-the-counter use. If your symptoms are severe, persistent, or worsening, please contact the clinic or seek urgent care.",
      matchedQuestion: "General medical guidance"
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
