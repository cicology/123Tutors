"use client"

import { FormEvent, useMemo, useState } from "react"
import Link from "next/link"
import { apiService } from "@/lib/api-service"

type CourseRow = {
  course: string
  hours: number
  rate: number
}

function createInvoiceId() {
  return `INV_${Date.now()}_${Math.floor(Math.random() * 1000)}`
}

const fieldClass =
  "mt-1 w-full rounded-xl border border-[rgba(31,27,23,0.18)] bg-white/90 px-3 py-2.5 text-sm text-[#1f1b17] shadow-[0_1px_0_rgba(255,255,255,0.65)_inset] outline-none transition focus:border-[#FF0090] focus:ring-2 focus:ring-[#FF0090]/20"

export function RequestTutorForm() {
  const [form, setForm] = useState({
    studentFirstName: "",
    studentLastName: "",
    studentEmail: "",
    studentPhoneWhatsapp: "",
    bursaryName: "",
    instituteName: "",
    instituteProgramme: "",
    instituteSpecialization: "",
    addressFull: "",
    tutoringType: "online",
    learningType: "one-on-one",
    tutoringStartPeriod: "",
    extraTutoringRequirements: "",
  })
  const [rows, setRows] = useState<CourseRow[]>([{ course: "", hours: 5, rate: 250 }])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const totalAmount = useMemo(
    () => rows.reduce((sum, row) => sum + Number(row.hours || 0) * Number(row.rate || 0), 0),
    [rows],
  )

  const addCourseRow = () => {
    setRows((prev) => [...prev, { course: "", hours: 5, rate: 250 }])
  }

  const removeCourseRow = (index: number) => {
    setRows((prev) => prev.filter((_, rowIndex) => rowIndex !== index))
  }

  const updateCourseRow = (index: number, nextRow: Partial<CourseRow>) => {
    setRows((prev) =>
      prev.map((row, rowIndex) => {
        if (rowIndex !== index) {
          return row
        }
        return { ...row, ...nextRow }
      }),
    )
  }

  const resetForm = () => {
    setForm({
      studentFirstName: "",
      studentLastName: "",
      studentEmail: "",
      studentPhoneWhatsapp: "",
      bursaryName: "",
      instituteName: "",
      instituteProgramme: "",
      instituteSpecialization: "",
      addressFull: "",
      tutoringType: "online",
      learningType: "one-on-one",
      tutoringStartPeriod: "",
      extraTutoringRequirements: "",
    })
    setRows([{ course: "", hours: 5, rate: 250 }])
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setSuccessMessage("")
    setErrorMessage("")

    try {
      const nonEmptyCourses = rows.filter((row) => row.course.trim().length > 0)
      if (nonEmptyCourses.length === 0) {
        throw new Error("Add at least one course before submitting.")
      }

      const requestPayload = {
        studentEmail: form.studentEmail.trim(),
        studentFirstName: form.studentFirstName.trim(),
        studentLastName: form.studentLastName.trim(),
        studentPhoneWhatsapp: form.studentPhoneWhatsapp || undefined,
        bursaryName: form.bursaryName || undefined,
        instituteName: form.instituteName || undefined,
        instituteProgramme: form.instituteProgramme || undefined,
        instituteSpecialization: form.instituteSpecialization || undefined,
        requestCourses: nonEmptyCourses.map((row) => row.course).join(", "),
        coursesAllocatedNumber: nonEmptyCourses.length,
        hoursListText: nonEmptyCourses.map((row) => Number(row.hours || 0)).join(","),
        hourlyRateListText: nonEmptyCourses.map((row) => Number(row.rate || 0)).join(","),
        totalAmount,
        platformFee: Number((totalAmount * 0.15).toFixed(2)),
        addressFull: form.addressFull || undefined,
        tutoringType: form.tutoringType,
        learningType: form.learningType,
        tutoringStartPeriod: form.tutoringStartPeriod || undefined,
        extraTutoringRequirements: form.extraTutoringRequirements || undefined,
        paid: false,
        creator: "next_request_form",
        userType: "user",
      }

      const requestResult: any = await apiService.createTutorRequest(requestPayload)
      const requestUniqueId = requestResult?.uniqueId || requestResult?.requestId || undefined

      const invoiceNumber = createInvoiceId()
      await apiService.createInvoice({
        invoiceNumber,
        uniqueId: invoiceNumber,
        studentEmail: form.studentEmail.trim(),
        studentName: `${form.studentFirstName.trim()} ${form.studentLastName.trim()}`.trim(),
        bursaryName: form.bursaryName || undefined,
        amount: totalAmount,
        status: "pending",
        paymentMethod: "pending",
        requestUniqueId,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        autoSendEmail: true,
      })

      setSuccessMessage("Tutor request submitted. An invoice has been queued for bursary/admin processing.")
      resetForm()
    } catch (error: any) {
      setErrorMessage(error?.message || "Could not submit tutor request.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="modern-shell min-h-screen">
      <section className="modern-content mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
        <div className="modern-panel rise-in rounded-3xl p-6 sm:p-8">
          <span className="modern-badge">Tutor Intake</span>
          <h1 className="mt-4 text-3xl font-semibold text-[#1f1b17] sm:text-4xl">Request a Tutor</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#4f4a44] sm:text-base">
            Submit the same operational details used in the live workflow. We preserve behavior and data contracts
            while upgrading UX quality.
          </p>
          <p className="mt-3 text-sm text-[#4f4a44]">
            Already onboarded?{" "}
            <Link className="font-semibold text-[#960056] underline" href="/login">
              Go to login
            </Link>
            .
          </p>
        </div>

        <form onSubmit={handleSubmit} className="modern-panel rise-in mt-6 space-y-6 rounded-3xl p-6 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-[#352f28]">
              First name
              <input className={fieldClass} required value={form.studentFirstName} onChange={(event) => setForm((prev) => ({ ...prev, studentFirstName: event.target.value }))} />
            </label>
            <label className="text-sm font-medium text-[#352f28]">
              Last name
              <input className={fieldClass} required value={form.studentLastName} onChange={(event) => setForm((prev) => ({ ...prev, studentLastName: event.target.value }))} />
            </label>
            <label className="text-sm font-medium text-[#352f28]">
              Student email
              <input className={fieldClass} required type="email" value={form.studentEmail} onChange={(event) => setForm((prev) => ({ ...prev, studentEmail: event.target.value }))} />
            </label>
            <label className="text-sm font-medium text-[#352f28]">
              Phone / WhatsApp
              <input className={fieldClass} value={form.studentPhoneWhatsapp} onChange={(event) => setForm((prev) => ({ ...prev, studentPhoneWhatsapp: event.target.value }))} />
            </label>
            <label className="text-sm font-medium text-[#352f28]">
              Bursary name
              <input className={fieldClass} value={form.bursaryName} onChange={(event) => setForm((prev) => ({ ...prev, bursaryName: event.target.value }))} />
            </label>
            <label className="text-sm font-medium text-[#352f28]">
              Institution
              <input className={fieldClass} value={form.instituteName} onChange={(event) => setForm((prev) => ({ ...prev, instituteName: event.target.value }))} />
            </label>
            <label className="text-sm font-medium text-[#352f28]">
              Programme
              <input className={fieldClass} value={form.instituteProgramme} onChange={(event) => setForm((prev) => ({ ...prev, instituteProgramme: event.target.value }))} />
            </label>
            <label className="text-sm font-medium text-[#352f28]">
              Specialization
              <input className={fieldClass} value={form.instituteSpecialization} onChange={(event) => setForm((prev) => ({ ...prev, instituteSpecialization: event.target.value }))} />
            </label>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-[#1f1b17]">Courses and hourly allocations</p>
            {rows.map((row, index) => (
              <div key={`${index}_${row.course}`} className="rounded-2xl border border-[rgba(31,27,23,0.14)] bg-white/70 p-4">
                <div className="grid gap-3 sm:grid-cols-12">
                  <label className="text-sm font-medium text-[#352f28] sm:col-span-6">
                    Course
                    <input className={fieldClass} required value={row.course} onChange={(event) => updateCourseRow(index, { course: event.target.value })} />
                  </label>
                  <label className="text-sm font-medium text-[#352f28] sm:col-span-2">
                    Hours
                    <input className={fieldClass} min={1} type="number" value={row.hours} onChange={(event) => updateCourseRow(index, { hours: Number(event.target.value || 0) })} />
                  </label>
                  <label className="text-sm font-medium text-[#352f28] sm:col-span-2">
                    Rate
                    <input className={fieldClass} min={0} type="number" value={row.rate} onChange={(event) => updateCourseRow(index, { rate: Number(event.target.value || 0) })} />
                  </label>
                  <div className="flex items-end sm:col-span-2">
                    <button className="modern-button-secondary w-full px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50" disabled={rows.length === 1} onClick={() => removeCourseRow(index)} type="button">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button className="modern-button-secondary px-4 py-2 text-sm" onClick={addCourseRow} type="button">
                Add another course
              </button>
              <p className="text-sm font-semibold text-[#1f1b17]">Estimated total: R {totalAmount.toFixed(2)}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-[#352f28]">
              Tutoring type
              <select className={fieldClass} value={form.tutoringType} onChange={(event) => setForm((prev) => ({ ...prev, tutoringType: event.target.value }))}>
                <option value="online">Online</option>
                <option value="in-person">In person</option>
              </select>
            </label>
            <label className="text-sm font-medium text-[#352f28]">
              Learning type
              <select className={fieldClass} value={form.learningType} onChange={(event) => setForm((prev) => ({ ...prev, learningType: event.target.value }))}>
                <option value="one-on-one">One-on-one</option>
                <option value="group">Group</option>
              </select>
            </label>
            <label className="text-sm font-medium text-[#352f28]">
              Preferred start period
              <input className={fieldClass} placeholder="e.g. Next week" value={form.tutoringStartPeriod} onChange={(event) => setForm((prev) => ({ ...prev, tutoringStartPeriod: event.target.value }))} />
            </label>
            <label className="text-sm font-medium text-[#352f28]">
              Location
              <input className={fieldClass} placeholder="City, suburb, campus" value={form.addressFull} onChange={(event) => setForm((prev) => ({ ...prev, addressFull: event.target.value }))} />
            </label>
          </div>

          <label className="block text-sm font-medium text-[#352f28]">
            Extra requirements
            <textarea className={`${fieldClass} min-h-24`} placeholder="Anything the tutor should know..." value={form.extraTutoringRequirements} onChange={(event) => setForm((prev) => ({ ...prev, extraTutoringRequirements: event.target.value }))} />
          </label>

          {errorMessage ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>
          ) : null}
          {successMessage ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {successMessage}
            </div>
          ) : null}

          <button className="modern-button-primary w-full px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Submitting request..." : "Submit tutor request"}
          </button>
        </form>
      </section>
    </main>
  )
}
