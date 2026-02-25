import Link from "next/link"

const pillars = [
  {
    title: "Student Requests",
    body: "Capture tutoring requests with complete course-hour data, then drive matching and billing from one flow.",
  },
  {
    title: "Bursary Operations",
    body: "Track budgets, student progress, lessons, and invoices per bursary with centralized reporting.",
  },
  {
    title: "Tutor Enablement",
    body: "Keep tutor assignment history, notifications, and performance signals aligned with requests.",
  },
  {
    title: "Migration Friendly",
    body: "Bubble parity in data model and workflows, with a modern UI layer ready for iterative refinement.",
  },
]

export default function HomePage() {
  return (
    <main className="modern-shell min-h-screen">
      <section className="modern-content mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="modern-panel rise-in rounded-3xl p-7 sm:p-12">
          <span className="modern-badge">123Tutors Platform</span>
          <h1 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight text-[#1f1b17] sm:text-5xl">
            Keep the live-site behavior.
            <br />
            Refurbish the interface with a modern product experience.
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-relaxed text-[#4f4a44] sm:text-base">
            The migration target is functional parity first, not a visual clone. This interface layer is structured to
            preserve the same flows while introducing modern navigation, hierarchy, spacing, and component quality.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="modern-button-primary px-5 py-3 text-sm" href="/request">
              Request a Tutor
            </Link>
            <Link className="modern-button-secondary px-5 py-3 text-sm" href="/login">
              Login
            </Link>
            <Link className="modern-button-secondary px-5 py-3 text-sm" href="/signup/student-parent">
              Student Signup
            </Link>
            <Link className="modern-button-secondary px-5 py-3 text-sm" href="/dashboard/bursary">
              Open Dashboard
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {pillars.map((item, index) => (
            <article
              key={item.title}
              className="modern-panel rise-in rounded-2xl p-5"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <h2 className="text-lg font-semibold text-[#1f1b17]">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#4f4a44]">{item.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

