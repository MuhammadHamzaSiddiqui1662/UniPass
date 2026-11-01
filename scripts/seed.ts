import { connectDB, University, Guide, FAQ, Testimonial, User, SiteSettings, Scholarship } from "../lib/db";
import { hashPassword } from "../lib/auth/session";

async function seed() {
  console.log("🌱 Seeding database...");

  await connectDB();

  // Create admin user from environment variables
  const adminEmail = process.env.ADMIN_EMAIL || "admin@unipass.local";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123456";

  const existingUser = await User.findOne({ email: adminEmail });
  if (!existingUser) {
    await User.create({
      email: adminEmail,
      password: await hashPassword(adminPassword),
      name: "Admin User",
      role: "admin",
      active: true,
    });
    console.log(`✅ Admin user created (${adminEmail})`);
  } else {
    console.log(`ℹ️ Admin user already exists (${adminEmail})`);
  }

  // Create site settings
  const existingSettings = await SiteSettings.findOne();
  if (!existingSettings) {
    await SiteSettings.create({});
    console.log("✅ Site settings created");
  }

  // Seed universities
  const universities = [
    {
      name: "Istanbul Technical University",
      slug: "istanbul-technical-university",
      type: "public",
      city: "Istanbul",
      tuitionFrom: 1200,
      description: "One of the world's oldest technical universities, ITU offers world-class engineering and architecture programs.",
      whyChoose: "Research excellence, historic campus in Istanbul, strong industry connections, and internationally recognized degrees.",
      fields: ["Engineering", "Architecture", "Sciences"],
      levels: ["Bachelor's", "Master's", "PhD"],
      turkiyeBurslariEligible: true,
      hasMeritScholarship: false,
      status: "published",
      metaTitle: "Istanbul Technical University | Study at ITU",
      metaDescription: "Explore programs at Istanbul Technical University, one of Turkey's leading technical universities.",
    },
    {
      name: "Middle East Technical University",
      slug: "middle-east-technical-university",
      type: "public",
      city: "Ankara",
      tuitionFrom: 1500,
      description: "METU is a top-ranked public university known for engineering, sciences, and English-medium instruction.",
      whyChoose: "Top-tier rankings, English instruction, research opportunities, and strong alumni network.",
      fields: ["Engineering", "Sciences", "Architecture"],
      levels: ["Bachelor's", "Master's", "PhD"],
      turkiyeBurslariEligible: true,
      hasMeritScholarship: false,
      status: "published",
    },
    {
      name: "Boğaziçi University",
      slug: "bogazici-university",
      type: "public",
      city: "Istanbul",
      tuitionFrom: 1800,
      description: "Boğaziçi offers rigorous academic programs taught in English with a beautiful Bosphorus-side campus.",
      whyChoose: "Prestigious reputation, stunning campus location, English instruction, and excellent faculty.",
      fields: ["Engineering", "Sciences", "Business"],
      levels: ["Bachelor's", "Master's", "PhD"],
      turkiyeBurslariEligible: true,
      hasMeritScholarship: false,
      status: "published",
    },
    {
      name: "Hacettepe University",
      slug: "hacettepe-university",
      type: "public",
      city: "Ankara",
      tuitionFrom: 800,
      description: "A comprehensive university with particularly strong medicine and health sciences programs.",
      whyChoose: "Excellent medical programs, affordable tuition, modern facilities, and research opportunities.",
      fields: ["Medicine and Health", "Sciences"],
      levels: ["Bachelor's", "Master's", "PhD"],
      turkiyeBurslariEligible: true,
      hasMeritScholarship: false,
      status: "published",
    },
    {
      name: "Ege University",
      slug: "ege-university",
      type: "public",
      city: "Izmir",
      tuitionFrom: 700,
      description: "Located in the coastal city of Izmir, Ege offers diverse programs in a welcoming Mediterranean setting.",
      whyChoose: "Coastal location, diverse programs, affordable costs, and quality education.",
      fields: ["Engineering", "Medicine and Health"],
      levels: ["Bachelor's", "Master's", "PhD"],
      turkiyeBurslariEligible: true,
      hasMeritScholarship: false,
      status: "published",
    },
    {
      name: "Bahçeşehir University",
      slug: "bahcesehir-university",
      type: "private",
      city: "Istanbul",
      tuitionFrom: 8000,
      description: "A dynamic private university with international partnerships and modern facilities.",
      whyChoose: "International exchange programs, modern campus, industry connections, and merit scholarships.",
      fields: ["Business", "Engineering", "Architecture"],
      levels: ["Bachelor's", "Master's"],
      turkiyeBurslariEligible: false,
      hasMeritScholarship: true,
      status: "published",
    },
    {
      name: "Bilkent University",
      slug: "bilkent-university",
      type: "private",
      city: "Ankara",
      tuitionFrom: 14000,
      description: "Turkey's first private university, known for academic excellence and full English instruction.",
      whyChoose: "Top-ranked programs, full scholarships available, English instruction, and research focus.",
      fields: ["Business", "Engineering", "Sciences"],
      levels: ["Bachelor's", "Master's", "PhD"],
      turkiyeBurslariEligible: false,
      hasMeritScholarship: true,
      status: "published",
    },
    {
      name: "Koç University",
      slug: "koc-university",
      type: "private",
      city: "Istanbul",
      tuitionFrom: 20000,
      description: "An elite private university offering generous merit scholarships and world-class education.",
      whyChoose: "Generous scholarships, small class sizes, excellent faculty, and strong international reputation.",
      fields: ["Engineering", "Business", "Sciences"],
      levels: ["Bachelor's", "Master's", "PhD"],
      turkiyeBurslariEligible: false,
      hasMeritScholarship: true,
      status: "published",
    },
  ];

  // MongoDB cannot keep a compound index on two array fields.
  await University.syncIndexes();

  const homeSlider = [
    "istanbul-technical-university",
    "middle-east-technical-university",
    "bogazici-university",
  ];
  const aliases: Record<string, string[]> = {
    "istanbul-technical-university": ["ITU", "Istanbul Teknik"],
    "middle-east-technical-university": ["METU", "ODTÜ", "ODTU"],
    "bogazici-university": ["BOUN", "Bogazici"],
    "bahcesehir-university": ["BAU", "Bahcesehir"],
    "koc-university": ["Koc"],
  };
  for (const [index, uni] of universities.entries()) {
    await University.findOneAndUpdate(
      { slug: uni.slug },
      {
        ...uni,
        country: "Türkiye",
        countryCode: "TR",
        scholarshipType:
          uni.slug === "bilkent-university"
            ? "fully_funded"
            : uni.hasMeritScholarship
              ? "partially_funded"
              : "none",
        aliases: aliases[uni.slug] ?? [],
        featuredOnHome: homeSlider.includes(uni.slug),
        homeOrder: index + 1,
      },
      { upsert: true, new: true }
    );
  }
  console.log(`✅ Seeded ${universities.length} universities`);

  // Seed guides
  const guides = [
    {
      title: "A complete guide for international students in Turkey",
      slug: "complete-guide-international-students-turkey",
      category: "Getting started",
      description: "Everything in one place, from choosing a city to your first weeks on campus.",
      content: "<h2>Welcome to Turkey</h2><p>This comprehensive guide covers everything you need to know about studying in Turkey as an international student from Pakistan.</p><h3>Choosing Your City</h3><p>Istanbul, Ankara, and Izmir each offer unique advantages...</p>",
      readTime: 15,
      featured: true,
      order: 1,
      status: "published",
    },
    {
      title: "Full application guide: from documents to offer letter",
      slug: "application-guide-documents-to-offer",
      category: "Applying",
      description: "Every step of applying, with a checklist you can tick off.",
      content: "<h2>Application Steps</h2><p>Follow this step-by-step guide to prepare and submit your university applications...</p>",
      readTime: 12,
      featured: false,
      order: 2,
      status: "published",
    },
    {
      title: "Turkey student visa: step by step guide",
      slug: "turkey-student-visa-guide",
      category: "Visa and arrival",
      description: "What to prepare, where to apply and how long it usually takes.",
      content: "<h2>Visa Application Process</h2><p>Learn how to apply for your Turkish student visa from Pakistan...</p>",
      readTime: 8,
      featured: false,
      order: 3,
      status: "published",
    },
  ];

  for (const guide of guides) {
    await Guide.findOneAndUpdate(
      { slug: guide.slug },
      guide,
      { upsert: true, new: true }
    );
  }
  console.log(`✅ Seeded ${guides.length} guides`);

  // Seed FAQs
  const faqs = [
    {
      question: "Is a Turkish degree recognized in Pakistan?",
      answer: "Degrees from Turkish universities recognized by YÖK can go through equivalence with the Higher Education Commission in Pakistan. Requirements vary by program, so check with HEC before you apply.",
      order: 1,
      status: "published",
    },
    {
      question: "How much does it cost per year?",
      answer: "Public universities range from $700-$2,000 per year, while private universities can cost $8,000-$20,000. Living expenses in Turkey are approximately $300-$500 per month depending on the city.",
      order: 2,
      status: "published",
    },
    {
      question: "Do I need to speak Turkish?",
      answer: "Many programs are taught in English, especially at the graduate level. However, learning Turkish will enhance your experience and open up more opportunities. Most universities offer preparatory Turkish language programs.",
      order: 3,
      status: "published",
    },
    {
      question: "Which exam do I need: YÖS, SAT or something else?",
      answer: "Public universities typically require the YÖS exam (Yabancı Uyruklu Öğrenci Sınavı), while some accept SAT. Private universities have their own entrance requirements. Check with each university for specific requirements.",
      order: 4,
      status: "published",
    },
    {
      question: "Can I work while I study?",
      answer: "International students can work part-time with proper permits. Consult your university's international office for current regulations and work permit procedures.",
      order: 5,
      status: "published",
    },
    {
      question: "What is daily life like for Pakistani students?",
      answer: "Turkey has a growing Pakistani student community. The culture is welcoming, halal food is widely available, and major cities have mosques and Islamic facilities. Many Pakistani students find it easy to adapt.",
      order: 6,
      status: "published",
    },
  ];

  for (const faq of faqs) {
    await FAQ.findOneAndUpdate(
      { question: faq.question },
      faq,
      { upsert: true, new: true }
    );
  }
  console.log(`✅ Seeded ${faqs.length} FAQs`);

  // Seed testimonials
  const testimonials = [
    {
      studentName: "Ahmed Khan",
      initials: "AK",
      quote: "The advisor explained the exam options in plain words. I finally knew which universities were worth applying to.",
      origin: "Lahore",
      university: "ITU",
      verified: true,
      order: 1,
      status: "published",
    },
    {
      studentName: "Fatima Ali",
      initials: "FA",
      quote: "I was worried about the cost. The budget breakdown showed me a public university in Ankara was realistic.",
      origin: "Karachi",
      university: "METU",
      verified: true,
      order: 2,
      status: "published",
    },
    {
      studentName: "Hassan Ahmed",
      initials: "HA",
      quote: "My parents wanted proof before deciding. The written checklist and honest answers made them comfortable.",
      origin: "Islamabad",
      university: "Hacettepe",
      verified: true,
      order: 3,
      status: "published",
    },
  ];

  for (const testimonial of testimonials) {
    await Testimonial.findOneAndUpdate(
      { studentName: testimonial.studentName },
      testimonial,
      { upsert: true, new: true }
    );
  }
  console.log(`✅ Seeded ${testimonials.length} testimonials`);

  // Seed scholarships
  const scholarships = [
    {
      name: "Türkiye Bursları",
      slug: "turkiye-burslari",
      type: "turkiye-burslari",
      amount: "Full coverage",
      coverage: ["Tuition", "Housing", "Monthly allowance", "Health insurance", "Turkish language year", "Flight ticket"],
      eligibility: {
        level: "All levels",
        ageLimit: 35,
        minMarks: 70,
      },
      description: "The Turkish government scholarship program covering full tuition and living expenses for international students.",
      externalUrl: "https://www.turkiyeburslari.gov.tr/",
      status: "published",
    },
  ];

  for (const scholarship of scholarships) {
    await Scholarship.findOneAndUpdate(
      { slug: scholarship.slug },
      scholarship,
      { upsert: true, new: true }
    );
  }
  console.log(`✅ Seeded ${scholarships.length} scholarships`);

  console.log("\n🎉 Seeding completed!");
  console.log("\n📝 Admin credentials:");
  console.log(`   Email: ${process.env.ADMIN_EMAIL || "admin@unipass.local"}`);
  console.log(`   Password: ${process.env.ADMIN_PASSWORD || "admin123456"}`);
  console.log("\n🌐 Visit http://localhost:43123/admin/login to access the admin panel\n");
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });
