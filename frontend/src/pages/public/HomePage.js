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

const workflowSteps = [
  {
    icon: ClipboardList,
    title: "Submit Tutor Request",
    body: "Students or parents share course needs, hours, preferred format, and location in one request.",
  },
  {
    icon: Search,
    title: "Smart Match + Notifications",
    body: "Matching logic scores tutor fit by subject, level, availability, and sends targeted tutor alerts.",
  },
  {
    icon: BookOpen,
    title: "Book and Pay",
    body: "Student confirms tutor allocation and completes payment through Paystack or EFT controls.",
  },
  {
    icon: CheckCircle2,
    title: "Lessons and Approvals",
    body: "Tutors log lessons, students review delivery, and approved sessions feed the payout pipeline.",
  },
  {
    icon: BarChart3,
    title: "Payout + Reporting",
    body: "Admin tracks invoices, tutor payout readiness, and end-to-end operational analytics.",
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
            <h3>Workflow Snapshot</h3>
            <p className="muted-text">
              The core flow follows a clear multi-step journey from request intake to tutor payout.
            </p>
            <div className="hero-workflow-preview">
              {workflowSteps.slice(0, 3).map((step, index) => (
                <div className="hero-workflow-chip" key={step.title}>
                  <span>Step {String(index + 1).padStart(2, "0")}</span>
                  <p>{step.title}</p>
                </div>
              ))}
            </div>
            <Link to="/dashboard/admin" className="inline-link">
              Open admin operations <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <section className="page-wrap">
        <div className="workflow-shell">
          <div className="workflow-head">
            <p className="eyebrow">How it works</p>
            <h2 className="section-title">123Tutors workflow UI</h2>
            <p className="muted-text">
              This workflow section mirrors the step-based UI style from the Jiffy Tutors reference: visual stages,
              clear progression, and operational detail at each point.
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
