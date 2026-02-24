import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  Search,
  ShieldCheck,
} from "lucide-react";
import Seo from "../../components/seo/Seo";

const highlights = [
  {
    icon: GraduationCap,
    title: "Matched to Your Subjects",
    body: "We find tutors who know your exact courses, school, or university programme — not just general subject areas.",
  },
  {
    icon: BookOpen,
    title: "School & University Support",
    body: "From Grade 8 to postgraduate level, we cover a wide range of subjects across South African institutions.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Online & In-Person",
    body: "Choose the format that suits you — one-on-one sessions online or face-to-face at your preferred location.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Tutors",
    body: "Every tutor on our platform is reviewed and vetted before being matched to students.",
  },
  {
    icon: BarChart3,
    title: "Bursary Programmes",
    body: "We work with leading bursary organisations to provide dedicated academic support for sponsored students.",
  },
  {
    icon: CheckCircle2,
    title: "Secure Payments",
    body: "Pay safely by card or EFT. Your payment is only processed once your tutor is confirmed.",
  },
];

const workflowSteps = [
  {
    icon: ClipboardList,
    title: "Submit Your Request",
    body: "Tell us your subjects, how many hours you need, your institution, and whether you prefer online or in-person sessions.",
  },
  {
    icon: Search,
    title: "We Find Your Tutor",
    body: "Our matching process identifies tutors suited to your specific subjects, level, and location — and notifies them directly.",
  },
  {
    icon: BookOpen,
    title: "Confirm and Pay",
    body: "Review your matched tutor, confirm the booking, and pay securely via card or EFT.",
  },
  {
    icon: CheckCircle2,
    title: "Start Learning",
    body: "Sessions begin on your schedule. Your tutor logs each lesson, and you approve hours as you go.",
  },
  {
    icon: BarChart3,
    title: "Track Your Progress",
    body: "See your remaining hours, session history, and invoices in your student dashboard at any time.",
  },
];

export default function HomePage() {
  return (
    <div>
      <Seo
        title="Home"
        description="123Tutors connects South African students with verified tutors for school, university, and bursary programmes. Request a tutor today."
      />
      <section className="hero">
        <div className="hero-grid">
          <div>
            <p className="eyebrow">Tutoring across South Africa</p>
            <h1>Find the right tutor, matched to your subjects.</h1>
            <p className="hero-copy">
              123Tutors connects students with verified tutors for school and university courses.
              Online or in-person, one-on-one or group — get started with a simple request.
            </p>
            <div className="hero-actions">
              <Link to="/request" className="btn btn-accent">
                Request a Tutor <ArrowRight size={16} />
              </Link>
              <Link to="/signup/tutor" className="btn btn-outline">
                Become a Tutor
              </Link>
            </div>
          </div>

          <div className="hero-card">
            <h3>How It Works</h3>
            <p className="muted-text">
              From your first request to your first session — here's how 123Tutors works.
            </p>
            <div className="hero-workflow-preview">
              {workflowSteps.slice(0, 3).map((step, index) => (
                <div className="hero-workflow-chip" key={step.title}>
                  <span>Step {String(index + 1).padStart(2, "0")}</span>
                  <p>{step.title}</p>
                </div>
              ))}
            </div>
            <Link to="/request" className="inline-link">
              Request your tutor now <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <section className="page-wrap">
        <div className="workflow-shell">
          <div className="workflow-head">
            <p className="eyebrow">How it works</p>
            <h2 className="section-title">Get started in five steps</h2>
            <p className="muted-text">
              We make it easy to go from submitting a request to having your first tutoring session booked and confirmed.
            </p>
          </div>
          <div className="workflow-list">
            {workflowSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <article className="workflow-step-card" key={step.title}>
                  <div className="workflow-step-side">
                    <p className="workflow-step-index">Step {String(index + 1).padStart(2, "0")}</p>
                    <div className="workflow-step-icon">
                      <Icon size={17} />
                    </div>
                  </div>
                  <div className="workflow-step-main">
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="page-wrap">
        <h2 className="section-title">Why students choose 123Tutors</h2>
        <div className="card-grid three">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <article className="card" key={item.title}>
                <div className="icon-chip">
                  <Icon size={18} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
