/* Generated from Scholarship_Eligibility_Scorecard_Template.xlsx. Edit in admin; these are the seeded defaults. */
import type { CountryOutlookInput, FundingRouteInput, ScorecardConfigInput } from "./types";

export const defaultScorecardConfig: ScorecardConfigInput = {
  "levels": [
    {
      "level": 1,
      "name": "Level 1 – Accessible",
      "meaning": "Government-to-government, bilateral-quota and supervisor-funded programs with many awards for Pakistani applicants and moderate academic cut-offs. Use as the safe first-wave application list.",
      "typicalPrograms": "CSC (China), Stipendium Hungaricum, Russian Govt. quota, Malaysian MIS / RA-GRA funding"
    },
    {
      "level": 2,
      "name": "Level 2 – Competitive",
      "meaning": "Merit-based national and university programs with structured selection and a clear research-fit test; fewer awards per applicant.",
      "typicalPrograms": "DAAD, MEXT, GKS, Türkiye Burslari, Commonwealth PhD, HEC Overseas, funded PhD posts in USA/Canada/Netherlands/Nordics"
    },
    {
      "level": 3,
      "name": "Level 3 – Elite",
      "meaning": "Global flagship awards at top-ranked universities where decisions weigh research record, referees and leadership; acceptance rates are very low.",
      "typicalPrograms": "Gates Cambridge, Clarendon, Fulbright, Knight-Hennessy, Vanier, HKPFS, NUS/NTU, KAUST, Swiss ESKAS, MSCA, Australian RTP"
    }
  ],
  "bands": [
    {
      "key": "strong",
      "label": "Strong Fit",
      "meaning": "Profile meets or exceeds the typical selection standard of this level.",
      "action": "Apply now; focus on tailoring SOP and supervisor match.",
      "thresholds": [
        75,
        78,
        82
      ]
    },
    {
      "key": "competitive",
      "label": "Competitive",
      "meaning": "Realistic chance, but one or two criteria are below the selection standard.",
      "action": "Fix the top improvement areas on the Scorecard, then apply.",
      "thresholds": [
        62,
        66,
        72
      ]
    },
    {
      "key": "borderline",
      "label": "Borderline",
      "meaning": "Outcome uncertain; profile is near the lower edge of this level.",
      "action": "Apply to a lower level in parallel; close gaps over 3-6 months.",
      "thresholds": [
        48,
        55,
        62
      ]
    },
    {
      "key": "notReady",
      "label": "Not Ready",
      "meaning": "Below the typical standard for this level.",
      "action": "Build profile (publications, English, supervisor contact) before applying at this level; target a lower level now."
    },
    {
      "key": "gate",
      "label": "Gate Not Met – Fix First",
      "meaning": "One or more mandatory prerequisites is below the minimum; a high score does not override this.",
      "action": "Resolve the failed gates listed on the Scorecard first."
    }
  ],
  "criteria": [
    {
      "key": "mastersCgpa",
      "label": "Master's / final-degree CGPA",
      "evidence": "Official transcript + degree certificate (HEC-attested), grading-scale statement.",
      "howToImprove": "Raise thesis grade; request grading-scale letter; add class-rank / top-percentile letter.",
      "weights": [
        9,
        10,
        10
      ]
    },
    {
      "key": "undergraduateCgpa",
      "label": "Undergraduate CGPA",
      "evidence": "Undergraduate transcript and degree.",
      "howToImprove": "Offset with strong Master's results and research output.",
      "weights": [
        6,
        6,
        6
      ]
    },
    {
      "key": "degreeRelevance",
      "label": "Degree level & field relevance",
      "evidence": "Degree certificates, transcripts, thesis title.",
      "howToImprove": "Complete thesis; add bridging courses or certifications if the field differs.",
      "weights": [
        8,
        7,
        6
      ]
    },
    {
      "key": "institution",
      "label": "Standing of degree-awarding institution",
      "evidence": "HEC recognition category; QS/THE ranking of the awarding institution.",
      "howToImprove": "Offset with references and co-authorship from well-ranked institutions.",
      "weights": [
        4,
        6,
        8
      ]
    },
    {
      "key": "publications",
      "label": "Research publications (discipline-adjusted)",
      "evidence": "Journal DOIs, Scopus/WoS/JCR quartile proof, Google Scholar / ORCID.",
      "howToImprove": "Convert thesis chapters to papers; target Scopus-indexed journals; collaborate internationally.",
      "weights": [
        7,
        12,
        18
      ]
    },
    {
      "key": "proposal",
      "label": "Research proposal quality",
      "evidence": "2-5 page proposal: problem, gap, objectives, methods, timeline, supervisor fit.",
      "howToImprove": "Align with supervisor's recent papers; add preliminary data; get faculty review.",
      "weights": [
        7,
        9,
        10
      ]
    },
    {
      "key": "english",
      "label": "English proficiency (IELTS-equivalent)",
      "evidence": "IELTS Academic / TOEFL iBT / PTE / Duolingo report, or MOI certificate where accepted.",
      "howToImprove": "Retake targeting weakest sub-score; many programs also require minimum per band.",
      "weights": [
        12,
        9,
        6
      ]
    },
    {
      "key": "standardisedTest",
      "label": "Standardised test (GRE / GAT)",
      "evidence": "Official GRE or GAT score report.",
      "howToImprove": "Take GRE for USA / Fulbright / Knight-Hennessy routes; GAT for HEC routes.",
      "weights": [
        2,
        3,
        4
      ]
    },
    {
      "key": "experience",
      "label": "Research / professional experience",
      "evidence": "Experience letters, RA contracts, lab/industry R&D certificates.",
      "howToImprove": "Join a funded project as RA; seek research internships or remote collaborations.",
      "weights": [
        5,
        6,
        7
      ]
    },
    {
      "key": "supervisor",
      "label": "Supervisor / host engagement",
      "evidence": "Email thread or acceptance letter from prospective supervisor.",
      "howToImprove": "Shortlist 15-20 professors; send tailored emails with CV + proposal; follow up after 10-14 days.",
      "weights": [
        12,
        11,
        9
      ]
    },
    {
      "key": "referees",
      "label": "Academic referees",
      "evidence": "Signed reference letters on letterhead; referee contact details.",
      "howToImprove": "Choose referees who supervised research; brief them with your CV and targets.",
      "weights": [
        5,
        5,
        5
      ]
    },
    {
      "key": "awards",
      "label": "Awards, patents & grants",
      "evidence": "Certificates: medals, merit scholarships, patents, grants, competitions.",
      "howToImprove": "Document every award with certificates; add grant or patent evidence.",
      "weights": [
        3,
        4,
        5
      ]
    },
    {
      "key": "sopCv",
      "label": "SOP & CV quality",
      "evidence": "Statement of purpose / personal statement; academic CV.",
      "howToImprove": "Tailor SOP per program; quantify achievements; keep CV concise and academic.",
      "weights": [
        6,
        5,
        4
      ]
    },
    {
      "key": "documents",
      "label": "Document readiness",
      "evidence": "Passport (≥18 months), HEC-attested degrees, transcripts, CV, SOP, proposal, references, English proof, CNIC/photos/police clearance.",
      "howToImprove": "Start HEC attestation and police clearance early (they are the usual bottlenecks).",
      "weights": [
        9,
        4,
        1
      ]
    },
    {
      "key": "compliance",
      "label": "Compliance & visa-risk profile",
      "evidence": "Visa history; explanation letters for gaps and refusals.",
      "howToImprove": "Document gap activities; explain and resolve prior refusals before applying.",
      "weights": [
        5,
        3,
        1
      ]
    }
  ],
  "gates": [
    {
      "key": "cgpa",
      "label": "Best academic CGPA",
      "why": "Every scholarship shortlists on a hard academic cut-off.",
      "minimums": [
        2.8,
        3.2,
        3.5
      ]
    },
    {
      "key": "english",
      "label": "English (IELTS-eq)",
      "why": "Missing language proof is a common automatic rejection.",
      "minimums": [
        6,
        6.5,
        7
      ]
    },
    {
      "key": "publications",
      "label": "Publication points",
      "why": "Research output is the main differentiator for PhD funding.",
      "minimums": [
        0,
        15,
        45
      ]
    },
    {
      "key": "documents",
      "label": "Document readiness",
      "why": "Incomplete files are often rejected without review.",
      "minimums": [
        60,
        75,
        90
      ]
    },
    {
      "key": "supervisor",
      "label": "Supervisor engagement",
      "why": "Many routes need host acceptance before nomination.",
      "minimums": [
        10,
        25,
        70
      ]
    },
    {
      "key": "compliance",
      "label": "Compliance & visa risk",
      "why": "Unresolved refusals and unexplained gaps raise rejection risk.",
      "minimums": [
        30,
        40,
        50
      ]
    }
  ],
  "mphilPublicationRelief": 0.5,
  "probability": {
    "pmax": [
      0.85,
      0.6,
      0.3
    ],
    "midpoint": [
      50,
      62,
      72
    ],
    "steepness": [
      0.12,
      0.12,
      0.12
    ],
    "gateFailMultiplier": 0.25,
    "cap": 0.95,
    "highAt": 0.5,
    "moderateAt": 0.3,
    "lowAt": 0.15
  },
  "scoring": {
    "cgpaFloor": 2,
    "cgpaCeiling": 4,
    "ieltsFloor": 5,
    "ieltsCeiling": 8,
    "greFloor": 295,
    "greCeiling": 330,
    "gatFloor": 50,
    "gatCeiling": 80,
    "experienceYearsForFull": 4,
    "pointsPerAward": 25,
    "publicationQ1": 30,
    "publicationOther": 15,
    "publicationConference": 5,
    "moiIelts": 6,
    "ratingScale": 5,
    "hostAcceptanceMinimum": 70
  },
  "gpaScales": [
    {
      "label": "GPA out of 4",
      "factor": 1
    },
    {
      "label": "GPA out of 5",
      "factor": 0.8
    },
    {
      "label": "CGPA out of 10",
      "factor": 0.4
    },
    {
      "label": "Percentage (%)",
      "factor": 1,
      "percentage": true
    }
  ],
  "percentageTable": [
    {
      "min": 0,
      "value": 0
    },
    {
      "min": 40,
      "value": 1
    },
    {
      "min": 45,
      "value": 1.5
    },
    {
      "min": 50,
      "value": 2
    },
    {
      "min": 55,
      "value": 2.4
    },
    {
      "min": 60,
      "value": 2.7
    },
    {
      "min": 65,
      "value": 3
    },
    {
      "min": 70,
      "value": 3.3
    },
    {
      "min": 75,
      "value": 3.6
    },
    {
      "min": 80,
      "value": 3.8
    },
    {
      "min": 85,
      "value": 4
    }
  ],
  "degreeStatuses": [
    {
      "label": "MS/MPhil completed (18 years)",
      "score": 100
    },
    {
      "label": "MS/MPhil – thesis/defence pending",
      "score": 85
    },
    {
      "label": "MSc/MA 2-year after 14-year BSc (16 years)",
      "score": 65
    },
    {
      "label": "BS/BSc (Hons) 4-year (16 years) only",
      "score": 60
    },
    {
      "label": "BSc/BA 2-year (14 years) only",
      "score": 20
    }
  ],
  "relevance": [
    {
      "label": "Same field as target",
      "factor": 1
    },
    {
      "label": "Closely related field",
      "factor": 0.85
    },
    {
      "label": "Different field",
      "factor": 0.55
    }
  ],
  "institutions": [
    {
      "label": "Top 500 (QS/THE) institution",
      "score": 100
    },
    {
      "label": "HEC W-category or QS/THE Top 1000",
      "score": 75
    },
    {
      "label": "HEC X/Y-category recognised",
      "score": 50
    },
    {
      "label": "Not HEC-recognised / unranked",
      "score": 20
    }
  ],
  "disciplines": [
    {
      "label": "Engineering & Computer Science",
      "multiplier": 1
    },
    {
      "label": "Natural & Physical Sciences",
      "multiplier": 1
    },
    {
      "label": "Health & Life Sciences",
      "multiplier": 1
    },
    {
      "label": "Social Sciences & Education",
      "multiplier": 1.25
    },
    {
      "label": "Business & Management",
      "multiplier": 1.25
    },
    {
      "label": "Humanities, Arts & Law",
      "multiplier": 1.5
    }
  ],
  "englishTests": [
    {
      "label": "IELTS",
      "kind": "ielts"
    },
    {
      "label": "TOEFL iBT",
      "kind": "toefl"
    },
    {
      "label": "PTE Academic",
      "kind": "pte"
    },
    {
      "label": "Duolingo English Test",
      "kind": "duolingo"
    },
    {
      "label": "MOI Certificate only",
      "kind": "moi"
    },
    {
      "label": "Not yet taken",
      "kind": "none"
    }
  ],
  "toeflTable": [
    {
      "min": 0,
      "value": 0
    },
    {
      "min": 35,
      "value": 5
    },
    {
      "min": 46,
      "value": 5.5
    },
    {
      "min": 60,
      "value": 6
    },
    {
      "min": 79,
      "value": 6.5
    },
    {
      "min": 94,
      "value": 7
    },
    {
      "min": 102,
      "value": 7.5
    },
    {
      "min": 110,
      "value": 8
    },
    {
      "min": 115,
      "value": 8.5
    }
  ],
  "pteTable": [
    {
      "min": 0,
      "value": 0
    },
    {
      "min": 36,
      "value": 5
    },
    {
      "min": 43,
      "value": 5.5
    },
    {
      "min": 50,
      "value": 6
    },
    {
      "min": 58,
      "value": 6.5
    },
    {
      "min": 65,
      "value": 7
    },
    {
      "min": 73,
      "value": 7.5
    },
    {
      "min": 79,
      "value": 8
    },
    {
      "min": 83,
      "value": 8.5
    }
  ],
  "duolingoTable": [
    {
      "min": 0,
      "value": 0
    },
    {
      "min": 75,
      "value": 5
    },
    {
      "min": 85,
      "value": 5.5
    },
    {
      "min": 95,
      "value": 6
    },
    {
      "min": 105,
      "value": 6.5
    },
    {
      "min": 115,
      "value": 7
    },
    {
      "min": 125,
      "value": 7.5
    },
    {
      "min": 135,
      "value": 8
    },
    {
      "min": 145,
      "value": 8.5
    }
  ],
  "standardisedTests": [
    {
      "label": "GRE General",
      "kind": "gre"
    },
    {
      "label": "GAT-General (HEC)",
      "kind": "gat"
    },
    {
      "label": "None / Not taken",
      "kind": "none"
    }
  ],
  "supervisors": [
    {
      "label": "Written acceptance / offer from supervisor",
      "score": 100
    },
    {
      "label": "Positive reply – willing to supervise (funding pending)",
      "score": 70
    },
    {
      "label": "Contacted – no reply yet",
      "score": 25
    },
    {
      "label": "Supervisors identified – not yet contacted",
      "score": 10
    },
    {
      "label": "No supervisor search started",
      "score": 0
    }
  ],
  "referees": [
    {
      "label": "3 strong referees incl. research supervisor – letters ready",
      "score": 100
    },
    {
      "label": "3 referees committed – letters pending",
      "score": 75
    },
    {
      "label": "2 referees committed",
      "score": 50
    },
    {
      "label": "1 referee / not yet committed",
      "score": 20
    },
    {
      "label": "None arranged",
      "score": 0
    }
  ],
  "refusals": [
    {
      "label": "None",
      "score": 100
    },
    {
      "label": "1 refusal – explained & resolved",
      "score": 70
    },
    {
      "label": "1 refusal – unresolved",
      "score": 35
    },
    {
      "label": "2 or more refusals",
      "score": 15
    }
  ],
  "gaps": [
    {
      "label": "0 years",
      "factor": 1
    },
    {
      "label": "1 year",
      "factor": 0.85
    },
    {
      "label": "2 years",
      "factor": 0.6
    },
    {
      "label": "3+ years",
      "factor": 0.4
    }
  ],
  "targetDegrees": [
    {
      "label": "PhD",
      "mphil": false
    },
    {
      "label": "MPhil",
      "mphil": true
    }
  ],
  "documents": [
    {
      "key": "passport",
      "label": "Valid passport (≥18 months validity)"
    },
    {
      "key": "attestation",
      "label": "Degrees & transcripts HEC-attested"
    },
    {
      "key": "cv",
      "label": "Updated academic CV"
    },
    {
      "key": "sop",
      "label": "SOP / personal statement drafted"
    },
    {
      "key": "proposal",
      "label": "Research proposal drafted"
    },
    {
      "key": "references",
      "label": "Reference letters ready (at least 2)"
    },
    {
      "key": "englishProof",
      "label": "English proof (test report or MOI certificate)"
    },
    {
      "key": "identity",
      "label": "CNIC, photos & police clearance ready"
    }
  ]
};

export const defaultFundingRoutes: FundingRouteInput[] = [
  {
    "order": 1,
    "name": "Chinese Government Scholarship (CSC) – Type A/B",
    "country": "China",
    "hosts": "Tsinghua, Peking, Zhejiang, Fudan, SJTU, USTC",
    "degreeLevel": "Master's / PhD",
    "stringency": 1,
    "coverage": "Tuition, accommodation, monthly stipend, insurance",
    "minCgpa": 3,
    "minEnglish": 6,
    "minPublicationPoints": 0,
    "maxAge": 40,
    "hostAcceptance": "Varies",
    "notes": "Type A via HEC/embassy channel; Type B via university pre-admission (supervisor/host acceptance helps). Chinese-taught programs may need HSK. Age cap ≈40 for doctoral.",
    "officialUrl": "csc.edu.cn / campuschina.org",
    "status": "published"
  },
  {
    "order": 2,
    "name": "Stipendium Hungaricum (Hungary–Pakistan bilateral)",
    "country": "Hungary",
    "hosts": "ELTE, BME, Szeged, Debrecen, Semmelweis",
    "degreeLevel": "Master's / PhD",
    "stringency": 1,
    "coverage": "Tuition, monthly stipend, accommodation allowance, health insurance",
    "minCgpa": 3,
    "minEnglish": 6,
    "minPublicationPoints": 0,
    "maxAge": null,
    "hostAcceptance": "Yes",
    "notes": "Apply via Tempus Public Foundation portal (Pakistan applications are typically routed through HEC – verify). PhD needs a master's degree, research plan and supervisor acceptance letter.",
    "officialUrl": "stipendiumhungaricum.hu",
    "status": "published"
  },
  {
    "order": 3,
    "name": "Russian Government Quota Scholarship",
    "country": "Russia",
    "hosts": "MSU, HSE, SPbU, MIPT, Bauman",
    "degreeLevel": "Master's / PhD",
    "stringency": 1,
    "coverage": "Tuition, stipend, dormitory",
    "minCgpa": 3,
    "minEnglish": 5.5,
    "minPublicationPoints": 0,
    "maxAge": null,
    "hostAcceptance": "Varies",
    "notes": "Pakistan quota; preparatory Russian-language year is common. Verify current availability, travel and banking conditions.",
    "officialUrl": "education-in-russia.com",
    "status": "published"
  },
  {
    "order": 4,
    "name": "Malaysia International Scholarship (MIS) / University RA-GRA Funding",
    "country": "Malaysia",
    "hosts": "UM, UKM, USM, UPM, UTM",
    "degreeLevel": "Master's / PhD",
    "stringency": 1,
    "coverage": "Tuition waiver and monthly allowance (varies by grant/supervisor)",
    "minCgpa": 3,
    "minEnglish": 6,
    "minPublicationPoints": 0,
    "maxAge": null,
    "hostAcceptance": "Yes",
    "notes": "Funding is often tied to supervisor grants or graduate assistantships – secure a supervisor first.",
    "officialUrl": "studymalaysia.com / graduate schools",
    "status": "published"
  },
  {
    "order": 5,
    "name": "University-Funded PhD Assistantships (RA/TA)",
    "country": "USA",
    "hosts": "R1 universities, e.g., UIUC, Georgia Tech, UT Austin, Purdue",
    "degreeLevel": "PhD",
    "stringency": 2,
    "coverage": "Tuition waiver + stipend + health insurance",
    "minCgpa": 3.3,
    "minEnglish": 6.5,
    "minPublicationPoints": 15,
    "maxAge": null,
    "hostAcceptance": "Varies",
    "notes": "Apply to the department; GRE optional or required by program; faculty funding and research fit decide offers.",
    "officialUrl": "Department admission pages",
    "status": "published"
  },
  {
    "order": 6,
    "name": "Fulbright Foreign Student Program (Pakistan)",
    "country": "USA",
    "hosts": "Placement at US universities via USEFP",
    "degreeLevel": "Master's / PhD",
    "stringency": 3,
    "coverage": "Tuition, stipend, airfare, insurance",
    "minCgpa": 3.5,
    "minEnglish": 7,
    "minPublicationPoints": 30,
    "maxAge": null,
    "hostAcceptance": "No",
    "notes": "Apply through USEFP; GRE/TOEFL typically required (verify); leadership & public-service profile; J-1 two-year home-residency rule applies.",
    "officialUrl": "usefp.org",
    "status": "published"
  },
  {
    "order": 7,
    "name": "Knight-Hennessy Scholars (Stanford)",
    "country": "USA",
    "hosts": "Stanford University",
    "degreeLevel": "PhD / Master's",
    "stringency": 3,
    "coverage": "Full funding (tuition, stipend, travel)",
    "minCgpa": 3.7,
    "minEnglish": 7,
    "minPublicationPoints": 60,
    "maxAge": null,
    "hostAcceptance": "Varies",
    "notes": "Separate KHS application plus Stanford department admission; emphasises leadership and civic mindedness.",
    "officialUrl": "knight-hennessy.stanford.edu",
    "status": "published"
  },
  {
    "order": 8,
    "name": "Gates Cambridge Scholarship",
    "country": "UK",
    "hosts": "University of Cambridge",
    "degreeLevel": "PhD / MPhil",
    "stringency": 3,
    "coverage": "Full cost: fees, maintenance, airfare",
    "minCgpa": 3.7,
    "minEnglish": 7.5,
    "minPublicationPoints": 30,
    "maxAge": null,
    "hostAcceptance": "Varies",
    "notes": "Applied for with the Cambridge course application; academic merit, leadership potential and commitment to improving others' lives; first-class equivalent.",
    "officialUrl": "gatescambridge.org",
    "status": "published"
  },
  {
    "order": 9,
    "name": "Clarendon Scholarships (Oxford)",
    "country": "UK",
    "hosts": "University of Oxford",
    "degreeLevel": "PhD / MPhil",
    "stringency": 3,
    "coverage": "Full fees + living stipend",
    "minCgpa": 3.7,
    "minEnglish": 7.5,
    "minPublicationPoints": 30,
    "maxAge": null,
    "hostAcceptance": "Varies",
    "notes": "Candidates are generally considered through the Oxford course application; first-class equivalent and strong research fit.",
    "officialUrl": "ox.ac.uk/clarendon",
    "status": "published"
  },
  {
    "order": 10,
    "name": "Commonwealth PhD Scholarship (UK)",
    "country": "UK",
    "hosts": "Varied UK universities",
    "degreeLevel": "PhD",
    "stringency": 2,
    "coverage": "Tuition, stipend, airfare",
    "minCgpa": 3.3,
    "minEnglish": 6.5,
    "minPublicationPoints": 15,
    "maxAge": null,
    "hostAcceptance": "No",
    "notes": "Apply through nominating bodies (HEC for Pakistan – verify) and UK university; development-impact narrative required.",
    "officialUrl": "cscuk.fcdo.gov.uk",
    "status": "published"
  },
  {
    "order": 11,
    "name": "UK University-Funded International PhD Studentships",
    "country": "UK",
    "hosts": "e.g., Edinburgh, Manchester, Glasgow, Leeds, Warwick",
    "degreeLevel": "PhD / MPhil",
    "stringency": 2,
    "coverage": "Fees + stipend (varies; some fees-only)",
    "minCgpa": 3.3,
    "minEnglish": 6.5,
    "minPublicationPoints": 15,
    "maxAge": null,
    "hostAcceptance": "Varies",
    "notes": "Apply to advertised studentships or school-level awards; supervisor nomination often needed; UK 2:1 equivalent minimum.",
    "officialUrl": "University scholarship pages / findaphd.com",
    "status": "published"
  },
  {
    "order": 12,
    "name": "DAAD Research Grants – Doctoral Programmes in Germany",
    "country": "Germany",
    "hosts": "TUM, LMU, Heidelberg, RWTH, TU Berlin",
    "degreeLevel": "PhD",
    "stringency": 2,
    "coverage": "Monthly stipend, travel allowance, health insurance",
    "minCgpa": 3.3,
    "minEnglish": 6.5,
    "minPublicationPoints": 15,
    "maxAge": null,
    "hostAcceptance": "Yes",
    "notes": "Supervisor/host acceptance generally required; strong academic record and development-related motivation; verify degree-recency rules.",
    "officialUrl": "daad.de",
    "status": "published"
  },
  {
    "order": 13,
    "name": "Germany – Employed PhD Positions (TV-L) & DFG Research Groups",
    "country": "Germany",
    "hosts": "TU9 universities, Fraunhofer, Helmholtz centres",
    "degreeLevel": "PhD",
    "stringency": 2,
    "coverage": "Salary (part/full-time employment)",
    "minCgpa": 3.3,
    "minEnglish": 6.5,
    "minPublicationPoints": 30,
    "maxAge": null,
    "hostAcceptance": "Yes",
    "notes": "Apply to advertised vacancies with CV, transcripts, proposal and referees; research output valued.",
    "officialUrl": "academics.de / euraxess.ec.europa.eu",
    "status": "published"
  },
  {
    "order": 14,
    "name": "Max Planck IMPRS / Elite PhD Programmes",
    "country": "Germany",
    "hosts": "Max Planck Institutes",
    "degreeLevel": "PhD",
    "stringency": 3,
    "coverage": "Stipend or salary + research budget",
    "minCgpa": 3.6,
    "minEnglish": 6.5,
    "minPublicationPoints": 45,
    "maxAge": null,
    "hostAcceptance": "Varies",
    "notes": "Programme-level competitive selection; research experience, Q1 publications and referee strength decisive.",
    "officialUrl": "mpg.de (IMPRS)",
    "status": "published"
  },
  {
    "order": 15,
    "name": "MEXT Embassy-Recommended Research Student (Japan)",
    "country": "Japan",
    "hosts": "Univ. of Tokyo, Kyoto, Osaka, Tohoku, Tokyo Tech",
    "degreeLevel": "Master's / PhD",
    "stringency": 2,
    "coverage": "Tuition, monthly allowance, airfare",
    "minCgpa": 3.3,
    "minEnglish": 6,
    "minPublicationPoints": 15,
    "maxAge": 35,
    "hostAcceptance": "Varies",
    "notes": "Embassy screening (documents + exam/interview); professor's provisional acceptance helps; age limit ≈35.",
    "officialUrl": "studyinjapan.go.jp",
    "status": "published"
  },
  {
    "order": 16,
    "name": "Korean Government Scholarship Program (GKS/KGSP) – Graduate",
    "country": "South Korea",
    "hosts": "SNU, KAIST, Yonsei, Korea Univ., POSTECH",
    "degreeLevel": "Master's / PhD",
    "stringency": 2,
    "coverage": "Tuition, stipend, airfare, language-training year",
    "minCgpa": 3,
    "minEnglish": 6,
    "minPublicationPoints": 0,
    "maxAge": 40,
    "hostAcceptance": "Varies",
    "notes": "Embassy and university tracks; Korean-language training year; transcript minimum around 80%; age cap ≈40 for graduate.",
    "officialUrl": "studyinkorea.go.kr",
    "status": "published"
  },
  {
    "order": 17,
    "name": "Türkiye Burslari (Türkiye Scholarships)",
    "country": "Türkiye",
    "hosts": "METU, Boğaziçi, ITU, Ankara University",
    "degreeLevel": "Master's / PhD",
    "stringency": 2,
    "coverage": "Tuition, stipend, housing, insurance, Turkish-language year",
    "minCgpa": 3,
    "minEnglish": 6,
    "minPublicationPoints": 0,
    "maxAge": 35,
    "hostAcceptance": "No",
    "notes": "Online application with interview stage; Turkish-language year unless English-taught; age cap ≈35 for doctoral.",
    "officialUrl": "turkiyeburslari.gov.tr",
    "status": "published"
  },
  {
    "order": 18,
    "name": "Swiss Government Excellence Scholarships (PhD research)",
    "country": "Switzerland",
    "hosts": "ETH Zurich, EPFL, UZH, Basel, Geneva",
    "degreeLevel": "PhD",
    "stringency": 3,
    "coverage": "Monthly stipend, tuition waiver, insurance, airfare",
    "minCgpa": 3.6,
    "minEnglish": 6.5,
    "minPublicationPoints": 45,
    "maxAge": null,
    "hostAcceptance": "Yes",
    "notes": "Host-professor acceptance letter mandatory; proposal and referees weighed heavily; verify country eligibility each year.",
    "officialUrl": "sbfi.admin.ch",
    "status": "published"
  },
  {
    "order": 19,
    "name": "Dutch University PhD Positions (salaried)",
    "country": "Netherlands",
    "hosts": "TU Delft, Leiden, Utrecht, Wageningen, TU/e",
    "degreeLevel": "PhD",
    "stringency": 2,
    "coverage": "Salary + benefits (4-year contract)",
    "minCgpa": 3.3,
    "minEnglish": 6.5,
    "minPublicationPoints": 30,
    "maxAge": null,
    "hostAcceptance": "Yes",
    "notes": "Apply to advertised vacancies; no separate scholarship form; high applicant volume; Master's degree required.",
    "officialUrl": "academictransfer.com",
    "status": "published"
  },
  {
    "order": 20,
    "name": "Nordic Salaried PhD Positions (SE/FI/NO/DK)",
    "country": "Nordic (SE/FI/NO/DK)",
    "hosts": "KTH, Lund, Uppsala, Aalto, Helsinki, NTNU, DTU",
    "degreeLevel": "PhD",
    "stringency": 2,
    "coverage": "Salary; tuition-free",
    "minCgpa": 3.3,
    "minEnglish": 6.5,
    "minPublicationPoints": 30,
    "maxAge": null,
    "hostAcceptance": "Yes",
    "notes": "Apply to advertised positions with transcripts, references and research statement; Master's degree required.",
    "officialUrl": "euraxess.ec.europa.eu / university job portals",
    "status": "published"
  },
  {
    "order": 21,
    "name": "Marie Skłodowska-Curie Doctoral Networks (EU)",
    "country": "EU (various)",
    "hosts": "Consortium universities across Europe",
    "degreeLevel": "PhD",
    "stringency": 3,
    "coverage": "Salary + mobility/living allowances",
    "minCgpa": 3.5,
    "minEnglish": 6.5,
    "minPublicationPoints": 30,
    "maxAge": null,
    "hostAcceptance": "Yes",
    "notes": "Apply to advertised network positions; mobility rule (not resident in host country >12 months in last 36); research experience valued.",
    "officialUrl": "euraxess.ec.europa.eu",
    "status": "published"
  },
  {
    "order": 22,
    "name": "Italian University PhD Scholarships (Borse di Dottorato) & DSU",
    "country": "Italy",
    "hosts": "Politecnico di Milano, Sapienza, Bologna, Padova",
    "degreeLevel": "PhD",
    "stringency": 2,
    "coverage": "Annual stipend; tuition waiver",
    "minCgpa": 3.2,
    "minEnglish": 6,
    "minPublicationPoints": 15,
    "maxAge": null,
    "hostAcceptance": "Varies",
    "notes": "Competitive entrance (CV + proposal + interview); some universities reserve places for international candidates.",
    "officialUrl": "University PhD calls",
    "status": "published"
  },
  {
    "order": 23,
    "name": "Australian Government RTP / University International Research Scholarships",
    "country": "Australia",
    "hosts": "ANU, Melbourne, Sydney, UNSW, Monash, UQ",
    "degreeLevel": "PhD / MPhil",
    "stringency": 3,
    "coverage": "Tuition + stipend + health cover",
    "minCgpa": 3.7,
    "minEnglish": 6.5,
    "minPublicationPoints": 45,
    "maxAge": null,
    "hostAcceptance": "Yes",
    "notes": "Ranked on academic merit and research output; supervisor endorsement required; first-class honours equivalent.",
    "officialUrl": "studyaustralia.gov.au",
    "status": "published"
  },
  {
    "order": 24,
    "name": "Vanier Canada Graduate Scholarships",
    "country": "Canada",
    "hosts": "Nominated via Canadian universities",
    "degreeLevel": "PhD",
    "stringency": 3,
    "coverage": "CAD 50,000/year for up to 3 years (verify)",
    "minCgpa": 3.8,
    "minEnglish": 6.5,
    "minPublicationPoints": 45,
    "maxAge": null,
    "hostAcceptance": "Yes",
    "notes": "Nominated by a Canadian university (host supervisor/department first); leadership, research potential and academic excellence.",
    "officialUrl": "vanier.gc.ca",
    "status": "published"
  },
  {
    "order": 25,
    "name": "Canadian University-Funded Graduate Packages (RA/TA + awards)",
    "country": "Canada",
    "hosts": "UofT, UBC, McGill, Waterloo, Alberta",
    "degreeLevel": "PhD / MPhil",
    "stringency": 2,
    "coverage": "Guaranteed funding package (varies)",
    "minCgpa": 3.3,
    "minEnglish": 6.5,
    "minPublicationPoints": 15,
    "maxAge": null,
    "hostAcceptance": "Yes",
    "notes": "Secure a supervisor first; funding commonly offered at admission; English proof and referees required.",
    "officialUrl": "University graduate admissions",
    "status": "published"
  },
  {
    "order": 26,
    "name": "NUS / NTU Research Scholarships & A*STAR SINGA",
    "country": "Singapore",
    "hosts": "NUS, NTU, A*STAR",
    "degreeLevel": "PhD",
    "stringency": 3,
    "coverage": "Tuition + stipend + allowances",
    "minCgpa": 3.7,
    "minEnglish": 6.5,
    "minPublicationPoints": 45,
    "maxAge": null,
    "hostAcceptance": "Varies",
    "notes": "Fixed intake cycles; research experience and strong referees; some departments require GRE/English scores.",
    "officialUrl": "nus.edu.sg / ntu.edu.sg / a-star.edu.sg",
    "status": "published"
  },
  {
    "order": 27,
    "name": "Hong Kong PhD Fellowship Scheme (HKPFS)",
    "country": "Hong Kong",
    "hosts": "HKU, CUHK, HKUST, PolyU, CityU, HKBU",
    "degreeLevel": "PhD",
    "stringency": 3,
    "coverage": "Monthly stipend + conference/travel allowance (3 years)",
    "minCgpa": 3.7,
    "minEnglish": 6.5,
    "minPublicationPoints": 45,
    "maxAge": null,
    "hostAcceptance": "Varies",
    "notes": "Apply via the university PhD application; university nominates for HKPFS; proposal + referees weighed.",
    "officialUrl": "rgc.gov.hk",
    "status": "published"
  },
  {
    "order": 28,
    "name": "KAUST Fellowship (MS/PhD)",
    "country": "Saudi Arabia",
    "hosts": "KAUST",
    "degreeLevel": "Master's / PhD",
    "stringency": 3,
    "coverage": "Full tuition, stipend, housing",
    "minCgpa": 3.5,
    "minEnglish": 6.5,
    "minPublicationPoints": 30,
    "maxAge": null,
    "hostAcceptance": "No",
    "notes": "Admission by KAUST programme; research experience and publications valued; verify English requirement.",
    "officialUrl": "kaust.edu.sa",
    "status": "published"
  },
  {
    "order": 29,
    "name": "UAE Funded PhD (MBZUAI, Khalifa University, UAEU)",
    "country": "UAE",
    "hosts": "MBZUAI, Khalifa University, UAEU",
    "degreeLevel": "PhD",
    "stringency": 2,
    "coverage": "Tuition + stipend",
    "minCgpa": 3.4,
    "minEnglish": 6.5,
    "minPublicationPoints": 30,
    "maxAge": null,
    "hostAcceptance": "Varies",
    "notes": "Programme-based funded places; strong STEM/AI profile helps.",
    "officialUrl": "mbzuai.ac.ae / ku.ac.ae",
    "status": "published"
  },
  {
    "order": 30,
    "name": "Aga Khan Foundation International Scholarship",
    "country": "Multi-country",
    "hosts": "Any recognised university (UK/USA/Europe)",
    "degreeLevel": "Master's / PhD",
    "stringency": 2,
    "coverage": "50% grant / 50% loan (verify)",
    "minCgpa": 3.3,
    "minEnglish": 6.5,
    "minPublicationPoints": 0,
    "maxAge": null,
    "hostAcceptance": "No",
    "notes": "Apply after securing admission; PhD funding limited; need-based; verify Pakistan eligibility.",
    "officialUrl": "akdn.org",
    "status": "published"
  },
  {
    "order": 31,
    "name": "HEC Pakistan Overseas Scholarships (PhD)",
    "country": "Multi-country",
    "hosts": "HEC partner universities",
    "degreeLevel": "PhD",
    "stringency": 2,
    "coverage": "Stipend, tuition, airfare; return/bonding obligation",
    "minCgpa": 3,
    "minEnglish": 6,
    "minPublicationPoints": 0,
    "maxAge": null,
    "hostAcceptance": "Varies",
    "notes": "Government of Pakistan scheme; follow HEC announcements; return-service bond applies.",
    "officialUrl": "hec.gov.pk",
    "status": "published"
  }
];

export const defaultCountryOutlooks: CountryOutlookInput[] = [
  {
    "order": 1,
    "country": "China",
    "summary": "CSC / HEC-CSC, Type B university awards, provincial & university scholarships",
    "tier1Share": 0.55,
    "tier2Share": 0.35,
    "tier3Share": 0.1,
    "accessFactor": 1.1,
    "status": "published"
  },
  {
    "order": 2,
    "country": "Hungary",
    "summary": "Stipendium Hungaricum (bilateral), university programs",
    "tier1Share": 0.65,
    "tier2Share": 0.3,
    "tier3Share": 0.05,
    "accessFactor": 1.1,
    "status": "published"
  },
  {
    "order": 3,
    "country": "Türkiye",
    "summary": "Türkiye Burslari, university assistantships",
    "tier1Share": 0.45,
    "tier2Share": 0.45,
    "tier3Share": 0.1,
    "accessFactor": 1,
    "status": "published"
  },
  {
    "order": 4,
    "country": "Russia",
    "summary": "Government quota, university awards (verify current conditions)",
    "tier1Share": 0.7,
    "tier2Share": 0.25,
    "tier3Share": 0.05,
    "accessFactor": 0.9,
    "status": "published"
  },
  {
    "order": 5,
    "country": "Malaysia",
    "summary": "MIS, university RA/GRA funding",
    "tier1Share": 0.55,
    "tier2Share": 0.35,
    "tier3Share": 0.1,
    "accessFactor": 1,
    "status": "published"
  },
  {
    "order": 6,
    "country": "South Korea",
    "summary": "GKS/KGSP, KAIST/SNU/POSTECH funded places",
    "tier1Share": 0.3,
    "tier2Share": 0.55,
    "tier3Share": 0.15,
    "accessFactor": 1,
    "status": "published"
  },
  {
    "order": 7,
    "country": "Japan",
    "summary": "MEXT, JSPS, university-funded places",
    "tier1Share": 0.15,
    "tier2Share": 0.55,
    "tier3Share": 0.3,
    "accessFactor": 0.95,
    "status": "published"
  },
  {
    "order": 8,
    "country": "Germany",
    "summary": "DAAD, employed PhD posts, IMPRS, DFG groups",
    "tier1Share": 0.15,
    "tier2Share": 0.55,
    "tier3Share": 0.3,
    "accessFactor": 0.95,
    "status": "published"
  },
  {
    "order": 9,
    "country": "Netherlands",
    "summary": "Salaried PhD vacancies at universities",
    "tier1Share": 0.1,
    "tier2Share": 0.5,
    "tier3Share": 0.4,
    "accessFactor": 0.9,
    "status": "published"
  },
  {
    "order": 10,
    "country": "Nordic (SE/FI/NO/DK)",
    "summary": "Salaried PhD positions, tuition-free",
    "tier1Share": 0.1,
    "tier2Share": 0.5,
    "tier3Share": 0.4,
    "accessFactor": 0.9,
    "status": "published"
  },
  {
    "order": 11,
    "country": "Switzerland",
    "summary": "ESKAS, ETH/EPFL funded PhD posts",
    "tier1Share": 0,
    "tier2Share": 0.2,
    "tier3Share": 0.8,
    "accessFactor": 0.85,
    "status": "published"
  },
  {
    "order": 12,
    "country": "Italy",
    "summary": "University PhD scholarships, DSU",
    "tier1Share": 0.3,
    "tier2Share": 0.55,
    "tier3Share": 0.15,
    "accessFactor": 1,
    "status": "published"
  },
  {
    "order": 13,
    "country": "UK",
    "summary": "Commonwealth, Gates Cambridge, Clarendon, university studentships",
    "tier1Share": 0.1,
    "tier2Share": 0.4,
    "tier3Share": 0.5,
    "accessFactor": 0.9,
    "status": "published"
  },
  {
    "order": 14,
    "country": "USA",
    "summary": "University RA/TA, Fulbright, Knight-Hennessy",
    "tier1Share": 0.05,
    "tier2Share": 0.5,
    "tier3Share": 0.45,
    "accessFactor": 0.9,
    "status": "published"
  },
  {
    "order": 15,
    "country": "Canada",
    "summary": "University funding packages, Vanier",
    "tier1Share": 0.05,
    "tier2Share": 0.5,
    "tier3Share": 0.45,
    "accessFactor": 0.9,
    "status": "published"
  },
  {
    "order": 16,
    "country": "Australia",
    "summary": "RTP, university international research scholarships",
    "tier1Share": 0.1,
    "tier2Share": 0.45,
    "tier3Share": 0.45,
    "accessFactor": 0.95,
    "status": "published"
  },
  {
    "order": 17,
    "country": "Singapore",
    "summary": "NUS/NTU research scholarships, A*STAR SINGA",
    "tier1Share": 0,
    "tier2Share": 0.25,
    "tier3Share": 0.75,
    "accessFactor": 0.9,
    "status": "published"
  },
  {
    "order": 18,
    "country": "Hong Kong",
    "summary": "HKPFS, university PhD scholarships",
    "tier1Share": 0,
    "tier2Share": 0.25,
    "tier3Share": 0.75,
    "accessFactor": 0.95,
    "status": "published"
  },
  {
    "order": 19,
    "country": "Saudi Arabia",
    "summary": "KAUST, KFUPM and other funded places",
    "tier1Share": 0.15,
    "tier2Share": 0.4,
    "tier3Share": 0.45,
    "accessFactor": 1,
    "status": "published"
  },
  {
    "order": 20,
    "country": "UAE",
    "summary": "MBZUAI, Khalifa University, UAEU funded places",
    "tier1Share": 0.1,
    "tier2Share": 0.5,
    "tier3Share": 0.4,
    "accessFactor": 1,
    "status": "published"
  }
];
