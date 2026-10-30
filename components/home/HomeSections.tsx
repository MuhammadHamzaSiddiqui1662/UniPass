import Link from "next/link";
import Asset from "@/components/home/Asset";
import CampusPhoto from "@/components/home/CampusPhoto";
import GuideArt from "@/components/home/GuideArt";
import ConsultationForm from "@/components/public/ConsultationForm";
import FaqAccordion from "@/components/home/FaqAccordion";
import { admissionSteps, type HomeFaq, type HomeGuide, type HomeUniversity } from "@/lib/home/content";
import { formatCurrency } from "@/lib/utils/format";
import { whatsappHref } from "@/lib/site/contact";

const trustPoints = [
  "Free first consultation",
  "Scholarships explained",
  "Support from application to arrival",
];

const consultPoints = [
  "A shortlist matched to your marks and budget",
  "A clear list of documents you need",
  "Honest advice on which scholarships fit",
];

const scholarshipCovers = ["Tuition", "Housing", "Monthly allowance", "Health insurance"];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-bunting lg:h-[716px]">
      <div
        className="absolute inset-0 bg-cover bg-[center_bottom]"
        style={{ backgroundImage: "url(/home/imgGroup1.svg)" }}
        aria-hidden
      />
      <img
        src="/home/imgSharedHeroOverlay.svg"
        alt=""
        width={1440}
        height={716}
        className="pointer-events-none absolute left-1/2 top-0 h-[716px] w-[1440px] max-w-none -translate-x-1/2"
      />
      <div className="relative z-10 mx-auto flex max-w-[1200px] flex-col px-4 pb-16 pt-36 sm:px-6 sm:pt-40 lg:h-[716px] lg:px-0 lg:pb-0 lg:pt-[176px]">
        <h1 className="text-h1-hero">
          <span className="block lg:whitespace-nowrap">Your degree in Türkiye</span>
          starts here
        </h1>
        <p className="mt-8 max-w-[490px] text-[18px] leading-[28px] text-on-dark-muted sm:text-[20px] sm:leading-[30px]">
          Compare universities, understand scholarships and get help with every step, from
          Pakistan to your first day on campus.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/universities"
            className="inline-flex h-[52px] items-center justify-center rounded-input bg-white px-6 text-[16px] font-bold text-ink transition-colors hover:bg-white/90 sm:min-w-[212px]"
          >
            Explore universities
          </Link>
          <Link
            href="/#book"
            className="btn-outline-dark h-[52px] px-6 text-[16px] sm:min-w-[252px]"
          >
            Book free consultation
          </Link>
        </div>
        <ul className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-x-10 sm:gap-y-3">
          {trustPoints.map((item) => (
            <li key={item} className="flex items-center gap-2 text-[15px] text-on-dark-muted">
              <Asset src="/home/imgVector2.svg" width={12.2} height={9.7} />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Universities({
  universities,
  total,
}: {
  universities: HomeUniversity[];
  total: number;
}) {
  return (
    <section className="bg-page-bg py-14 lg:pb-[88px] lg:pt-[100px]">
      <div className="container-1200">
        <h2 className="text-h2">Explore universities in Türkiye</h2>
        <p className="mt-4 max-w-[548px] text-[18px] leading-[28px] text-body">
          A preview of the full list. Filter by city, field and university type on the dedicated
          page.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {universities.map((university, index) => (
            <article
              key={university.slug}
              className="flex flex-col overflow-hidden rounded-card border-[1.2px] border-border bg-white"
            >
              <CampusPhoto
                src={university.image}
                alt=""
                index={index}
              />
              <div className="flex flex-1 flex-col px-[22px] pb-5 pt-[18px]">
                <div className="flex flex-wrap gap-2">
                  <span className={university.type === "public" ? "chip-success" : "chip-tint"}>
                    {university.type === "public" ? "Public" : "Private"}
                  </span>
                  <span className="chip-outline">{university.city}</span>
                </div>
                <h3 className="mt-3 font-display text-[20px] leading-6 text-ink">
                  <Link href={`/universities/${university.slug}`} className="hover:text-navy">
                    {university.name}
                  </Link>
                </h3>
                <p className="mt-3 text-[14px] leading-5 text-body">
                  Fields: {university.fields.join(", ")}
                </p>
                <p className="text-[14px] leading-5 text-body">
                  Levels: {university.levels.join(", ")}
                </p>
                <div className="mt-4 border-t border-border pt-4">
                  <div className="flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[13px] text-body">Tuition from</p>
                      <p className="mt-0.5 flex flex-wrap items-baseline gap-x-2">
                        <span className="font-display text-[28px] leading-none text-ink">
                          {formatCurrency(university.tuitionFrom)}
                        </span>
                        <span className="whitespace-nowrap text-[13px] text-body">a year (sample)</span>
                      </p>
                    </div>
                    <Link
                      href={`/universities/${university.slug}`}
                      className="inline-flex h-11 min-w-[104px] items-center justify-center rounded-input bg-navy px-4 text-[15px] font-bold text-white transition-colors hover:bg-navy/90"
                    >
                      Explore
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-8 text-center text-[15px] text-body">
          Showing {universities.length} of {total} universities
        </p>
        <div className="mt-4 flex justify-center">
          <Link href="/universities" className="btn-primary h-[54px] w-full max-w-[340px]">
            View all universities
          </Link>
        </div>
      </div>
    </section>
  );
}

export function Scholarships() {
  return (
    <section className="bg-surface-tint py-14 lg:py-[72px]">
      <div className="container-1200">
        <div className="grid items-center gap-8 rounded-form-card border-[1.2px] border-border bg-white p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_480px] lg:gap-10 lg:p-10">
          <div>
            <h2 className="max-w-[520px] font-display text-[32px] leading-[38px] text-ink">
              Scholarships that can cover your studies
            </h2>
            <p className="mt-4 max-w-[500px] text-[18px] leading-[28px] text-body">
              Türkiye Bursları can cover tuition, housing and more. Many universities also reduce
              tuition for strong marks.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              {scholarshipCovers.map((item) =>
                item === "Monthly allowance" ? (
                  <span key={item} className="relative inline-flex h-[26px] w-[141px] items-center justify-center">
                    <Asset
                      src="/home/imgVector36.svg"
                      width={141.34}
                      height={26}
                      className="absolute left-0 top-0"
                    />
                    <span className="relative text-[13px] font-bold text-success-text">{item}</span>
                  </span>
                ) : (
                  <span key={item} className="chip-success">
                    {item}
                  </span>
                ),
              )}
            </div>
            <Link href="/scholarships" className="btn-cta mt-6 h-[52px] px-8 text-[16px]">
              Check scholarship eligibility
            </Link>
          </div>
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-panel bg-surface-tint px-6 py-10 text-center lg:min-h-[280px]">
            <p className="font-display text-[17px] text-navy">Up to</p>
            <p className="mt-1 font-display text-[58px] leading-none text-navy">100%</p>
            <p className="mt-3 text-[15px] text-body">tuition covered by Türkiye Bursları</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AdmissionSteps() {
  return (
    <section id="admission-steps" className="scroll-mt-28 bg-white py-14 lg:pb-20 lg:pt-14">
      <div className="container-1200">
        <h2 className="text-h2 max-w-[720px]">
          Five steps from Pakistan to your first class
        </h2>
        <p className="mt-4 text-[18px] leading-[28px] text-body">
          You do not have to work out the order alone.
        </p>

        <ol className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:mt-12 lg:grid-cols-5 lg:gap-6">
          {admissionSteps.map((step, index) => (
            <li key={step.num} className="relative">
              <div className="relative z-10 grid h-11 w-11 place-items-center">
                <Asset
                  src="/home/imgVector41.svg"
                  width={44}
                  height={44}
                  className="absolute left-0 top-0"
                />
                <span className="relative font-display text-[20px] text-white">{step.num}</span>
              </div>
              {index < admissionSteps.length - 1 && (
                <Asset
                  src="/home/imgVector42.svg"
                  width={186}
                  height={2}
                  className="absolute left-11 top-[21px] hidden lg:block"
                />
              )}
              <h3 className="mt-4 font-display text-[20px] leading-6 text-ink">{step.title}</h3>
              <p className="mt-2 text-[15px] leading-[22px] text-body">
                {step.lines[0]}
                <br />
                {step.lines[1]}
              </p>
              <span className="chip-outline mt-4">{step.duration}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Guides({ guides, total }: { guides: HomeGuide[]; total: number }) {
  return (
    <section className="relative overflow-hidden bg-white py-14 lg:pb-[88px] lg:pt-16">
      <img
        src="/home/imgVector57.svg"
        alt=""
        width={1440}
        height={790}
        className="pointer-events-none absolute left-1/2 top-0 max-w-none -translate-x-1/2"
        style={{ width: 1440, height: 790 }}
      />
      <div className="container-1200 relative">
        <h2 className="text-h2">Guides for studying in Turkey</h2>
        <p className="mt-4 max-w-[640px] text-[18px] leading-[28px] text-body">
          Plain-language answers, written for students applying from Pakistan.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {guides.map((guide) => (
            <article
              key={guide.slug}
              className="flex flex-col overflow-hidden rounded-card border-[1.2px] border-border bg-white"
            >
              <GuideArt art={guide.art} />
              <div className="flex flex-1 flex-col px-[22px] pb-5">
                <span className="chip-tint w-fit">{guide.category}</span>
                <h3 className="mt-3 font-display text-[20px] leading-[26px] text-ink">
                  {guide.title}
                </h3>
                <p className="mt-3 text-[15px] leading-[22px] text-body">{guide.description}</p>
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
                  <span className="text-[14px] text-body">{guide.readTime} min read</span>
                  <Link
                    href={`/guides/${guide.slug}`}
                    className="btn-outline h-10 px-4 text-[15px]"
                  >
                    Read guide
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-8 text-center text-[15px] text-body">
          Showing {guides.length} of {total} guides
        </p>
        <div className="mt-4 flex justify-center">
          <Link href="/guides" className="btn-primary h-[54px] w-full max-w-[340px]">
            View all guides
          </Link>
        </div>
      </div>
    </section>
  );
}

export function BookConsultation() {
  return (
    <section id="book" className="scroll-mt-28 bg-navy py-16 lg:py-[100px]">
      <div className="container-1200 grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_560px] lg:gap-10">
        <div>
          <h2 className="text-h2-cta max-w-[520px]">
            Talk to an advisor
            <br />
            for 20 minutes.
            <br />
            It is free.
          </h2>
          <ul className="mt-8 space-y-5">
            {consultPoints.map((item) => (
              <li key={item} className="flex items-start gap-3 text-[18px] leading-7 text-white">
                <Asset
                  src="/home/imgVector83.svg"
                  width={12.4}
                  height={9.9}
                  className="mt-2 shrink-0"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <a
            href={whatsappHref()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline-dark mt-8 h-[52px] px-6 text-[16px]"
          >
            Message on WhatsApp instead
          </a>
        </div>
        <ConsultationForm />
      </div>
    </section>
  );
}

export function Questions({ faqs }: { faqs: HomeFaq[] }) {
  return (
    <section id="faq" className="relative scroll-mt-28 overflow-hidden bg-page-bg py-16 lg:py-[88px]">
      <img
        src="/home/imgVector91.svg"
        alt=""
        width={1440}
        height={720}
        className="pointer-events-none absolute left-1/2 top-0 max-w-none -translate-x-1/2"
        style={{ width: 1440, height: 720 }}
      />
      <div className="container-1200 relative grid gap-10 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-16">
        <div>
          <h2 className="text-h2">
            Questions
            <br />
            students ask
            <br />
            most
          </h2>
          <p className="mt-5 max-w-[280px] text-[17px] leading-[26px] text-body">
            Cannot find your answer? Ask us on WhatsApp and we will reply.
          </p>
          <a
            href={whatsappHref()}
            target="_blank"
            rel="noopener noreferrer"
            className="relative mt-6 inline-flex h-12 w-[220px] items-center justify-center"
          >
            <Asset
              src="/home/imgVector92.svg"
              width={220}
              height={48}
              className="absolute left-0 top-0"
            />
            <span className="relative text-[15px] font-bold text-white">Ask on WhatsApp</span>
          </a>
        </div>
        <FaqAccordion faqs={faqs} />
      </div>
    </section>
  );
}
