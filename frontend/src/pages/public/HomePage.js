import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, BookOpen, BriefcaseBusiness, GraduationCap, ShieldCheck } from "lucide-react";
import Seo from "../../components/seo/Seo";

const highlights = [
  {
    icon: GraduationCap,
    title: "Smart Tutor Matching",
    body: "Automatically matches student requests to tutors based on subject, level, availability, and location.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Tutor Workflow",
    body: "Applications, job notifications, student allocation, lesson logging, and payout visibility in one dashboard.",
  },
  {
    icon: BarChart3,
    title: "Admin + Analytics",
    body: "End-to-end request operations, invoicing, payroll flow, and earnings/ROI analytics.",
  },
  {
    icon: ShieldCheck,
    title: "Payments + Auditability",
    body: "Supports Paystack and EFT workflows with traceable references and operational controls.",
  },
  {
    icon: BookOpen,
    title: "Student Experience",
    body: "Request tutors, view bookings, approve lessons, add hours, and track remaining hours clearly.",
  },
];

export default function HomePage() {
  return (
    <div>
      <Seo
        title="Home"
        description="123Tutors platform for tutor requests, tutor matching, bookings, payments, and operations."
      />
      <section className="hero">
        <div className="hero-grid">
          <div>
            <p className="eyebrow">123tutors platform</p>
            <h1>From tutor request to payout, in one JavaScript platform.</h1>
            <p className="hero-copy">
              This platform now combines public request flows, student/tutor/admin dashboards,
              payment workflows, invoicing hooks, and operational analytics while preserving your
              current visual direction.
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
            <h3>Core Journey</h3>
            <ol>
              <li>Student/parent submits request + courses + hours</li>
              <li>Tutors are found and notified with matching score</li>
              <li>Student books and pays via Paystack or EFT</li>
              <li>Tutor logs lessons, student approves, admin tracks payouts</li>
            </ol>
            <Link to="/dashboard/admin" className="inline-link">
              Open admin operations <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <section className="page-wrap">
        <h2 className="section-title">Platform modules</h2>
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
