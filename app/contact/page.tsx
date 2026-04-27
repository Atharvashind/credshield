import { PageShell } from "@/components/PageShell";
import { ContactForm } from "@/components/ContactForm";

const CHANNELS = [
  {
    label: "GitHub",
    value: "github.com/monolith-protocol",
    href: "https://github.com",
  },
  {
    label: "Discord",
    value: "discord.gg/monolith",
    href: "https://discord.com",
  },
  {
    label: "Email",
    value: "hello@monolith.finance",
    href: "mailto:hello@monolith.finance",
  },
];

export default function ContactPage() {
  return (
    <PageShell>
      <div className="mb-12">
        <p className="font-sans text-xs tracking-[0.2em] uppercase text-stone-600 mb-4">
          Contact
        </p>
        <h2 className="font-serif text-4xl font-normal text-stone-100 leading-tight max-w-lg">
          Get in touch.
        </h2>
        <p className="mt-4 font-sans text-sm text-stone-500 max-w-sm leading-relaxed">
          For institutional inquiries, partnership proposals, or technical
          questions about the protocol.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
        {/* Contact form */}
        <ContactForm />

        {/* Channels */}
        <div className="flex flex-col gap-6">
          <p className="font-sans text-xs tracking-[0.18em] uppercase text-stone-600">
            Other channels
          </p>
          <div className="space-y-4">
            {CHANNELS.map((ch) => (
              <a
                key={ch.label}
                href={ch.href}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  flex items-center justify-between
                  glass-panel rounded-xl px-6 py-4
                  hover:border-beige/20 transition-colors duration-200
                  group
                "
              >
                <div>
                  <p className="font-sans text-xs text-stone-600 mb-1">{ch.label}</p>
                  <p className="font-sans text-sm text-stone-300 group-hover:text-beige transition-colors">
                    {ch.value}
                  </p>
                </div>
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  className="w-4 h-4 text-stone-700 group-hover:text-beige transition-colors"
                >
                  <path
                    d="M3 13L13 3M13 3H6M13 3v7"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            ))}
          </div>

          <div className="mt-4 glass-panel rounded-xl px-6 py-5">
            <p className="font-sans text-xs text-stone-600 mb-2">Response time</p>
            <p className="font-sans text-sm text-stone-400 leading-relaxed">
              We typically respond within 24 hours on business days. For urgent
              security disclosures, use the email channel directly.
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
