import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { TertiaryName } from '../tertiary-names/tertiary-names.entity';
import { SchoolName } from '../school-names/school-names.entity';
import { BursaryName } from '../bursary-names/bursary-names.entity';
import { PromoCode } from '../promo-codes/promo-codes.entity';
import { TutorSessionsOrder } from '../tutor-sessions-orders/tutor-sessions-orders.entity';
import { TutorJobNotification } from '../tutor-job-notifications/tutor-job-notifications.entity';
import { TutorStudentHour } from '../tutor-student-hours/tutor-student-hours.entity';
import { StudentLesson } from '../student-lessons/student-lessons.entity';

@Entity('tutor_requests')
export class TutorRequest {
  @PrimaryColumn({ name: 'unique_id' })
  uniqueId: string;

  // Address fields
  @Column({ name: 'address_city', nullable: true })
  addressCity: string;

  @Column({ name: 'address_country', nullable: true })
  addressCountry: string;

  @Column({ name: 'address_full', type: 'text', nullable: true })
  addressFull: string;

  @Column({ name: 'address_province', nullable: true })
  addressProvince: string;

  @Column({ name: 'address_suburb_town', nullable: true })
  addressSuburbTown: string;

  // Course allocation fields
  @Column({ name: 'all_courses_allocated', type: 'text', nullable: true })
  allCoursesAllocated: string;

  @Column({ name: 'courses_allocated_number', type: 'int', nullable: true })
  coursesAllocatedNumber: number;

  @Column({ name: 'request_courses', type: 'text', nullable: true })
  requestCourses: string;

  @Column({ name: 'request_courses_unallocated', type: 'text', nullable: true })
  requestCoursesUnallocated: string;

  @Column({ name: 'request_available_courses_request_id_list', type: 'text', nullable: true })
  requestAvailableCoursesRequestIdList: string;

  // Bursary fields
  @Column({ name: 'bursary_email', nullable: true })
  bursaryEmail: string;

  @Column({ name: 'bursary_name', nullable: true })
  bursaryName: string;

  @Column({ name: 'bursary_phone', nullable: true })
  bursaryPhone: string;

  @Column({ name: 'bursary_client_request_auto_approved', type: 'boolean', default: false })
  bursaryClientRequestAutoApproved: boolean;

  @Column({ name: 'bursary_debt', type: 'decimal', precision: 10, scale: 2, nullable: true })
  bursaryDebt: number;

  // Contact fields
  @Column({ name: 'contact_comments', type: 'text', nullable: true })
  contactComments: string;

  @Column({ name: 'contact_sales', nullable: true })
  contactSales: string;

  @Column({ name: 'contacted_sales_boolean', type: 'boolean', default: false })
  contactedSalesBoolean: boolean;

  @Column({ name: 'contacted_type', nullable: true })
  contactedType: string;

  // Financial fields
  @Column({ name: 'credited', type: 'decimal', precision: 10, scale: 2, nullable: true })
  credited: number;

  @Column({ name: 'eft_paid', type: 'decimal', precision: 10, scale: 2, nullable: true })
  eftPaid: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalAmount: number;

  @Column({ name: 'platform_fee', type: 'decimal', precision: 10, scale: 2, nullable: true })
  platformFee: number;

  @Column({ name: 'refund_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  refundAmount: number;

  @Column({ name: 'refund_reason', type: 'text', nullable: true })
  refundReason: string;

  @Column({ name: 'refunded', type: 'boolean', default: false })
  refunded: boolean;

  // Tutoring requirements
  @Column({ name: 'extra_tutoring_requirements', type: 'text', nullable: true })
  extraTutoringRequirements: string;

  @Column({ name: 'hourly_rate_list_text', type: 'text', nullable: true })
  hourlyRateListText: string;

  @Column({ name: 'hours_list_text', type: 'text', nullable: true })
  hoursListText: string;

  // Installment fields
  @Column({ name: 'installment_payment', type: 'boolean', default: false })
  installmentPayment: boolean;

  @Column({ name: 'installment_r', type: 'decimal', precision: 10, scale: 2, nullable: true })
  installmentR: number;

  @Column({ name: 'installment_1_paid', type: 'boolean', default: false })
  installment1Paid: boolean;

  @Column({ name: 'installment_2_paid', type: 'boolean', default: false })
  installment2Paid: boolean;

  @Column({ name: 'installment_3_paid', type: 'boolean', default: false })
  installment3Paid: boolean;

  @Column({ name: 'installment_paid_up', type: 'boolean', default: false })
  installmentPaidUp: boolean;

  // Institute fields
  @Column({ name: 'institute_code', nullable: true })
  instituteCode: string;

  @Column({ name: 'institute_name', nullable: true })
  instituteName: string;

  @Column({ name: 'institute_programme', nullable: true })
  instituteProgramme: string;

  @Column({ name: 'institute_specialization', nullable: true })
  instituteSpecialization: string;

  @Column({ name: 'institute_student_year_of_study', type: 'int', nullable: true })
  instituteStudentYearOfStudy: number;

  // Invoice fields
  @Column({ name: 'invoice_number', nullable: true })
  invoiceNumber: string;

  // Language fields
  @Column({ name: 'language_1_main', nullable: true })
  language1Main: string;

  @Column({ name: 'language_2_other', nullable: true })
  language2Other: string;

  @Column({ name: 'learning_type', nullable: true })
  learningType: string;

  // Marketing fields
  @Column({ name: 'marketing_meme_page_influencer', nullable: true })
  marketingMemePageInfluencer: string;

  @Column({ name: 'marketing_feedback', type: 'text', nullable: true })
  marketingFeedback: string;

  @Column({ name: 'marketing_feedback_other', type: 'text', nullable: true })
  marketingFeedbackOther: string;

  // Request status fields
  @Column({ name: 'new_system_request', type: 'boolean', default: false })
  newSystemRequest: boolean;

  @Column({ name: 'not_interested', type: 'boolean', default: false })
  notInterested: boolean;

  @Column({ name: 'not_interested_comments', type: 'text', nullable: true })
  notInterestedComments: string;

  @Column({ name: 'request_delete', type: 'boolean', default: false })
  requestDelete: boolean;

  // Payment fields
  @Column({ name: 'paid', type: 'boolean', default: false })
  paid: boolean;

  @Column({ name: 'paid_date', type: 'timestamp', nullable: true })
  paidDate: Date;

  @Column({ name: 'responsible_for_payment', nullable: true })
  responsibleForPayment: string;

  // Promo code fields
  @Column({ name: 'promo_code', nullable: true })
  promoCode: string;

  @Column({ name: 'promo_code_discount', type: 'decimal', precision: 5, scale: 2, nullable: true })
  promoCodeDiscount: number;

  @Column({ name: 'promo_code_discount_off_r', type: 'decimal', precision: 10, scale: 2, nullable: true })
  promoCodeDiscountOffR: number;

  @Column({ name: 'promo_code_valid', type: 'boolean', default: false })
  promoCodeValid: boolean;

  // Recipient fields
  @Column({ name: 'recipient_email', nullable: true })
  recipientEmail: string;

  @Column({ name: 'recipient_first_name', nullable: true })
  recipientFirstName: string;

  @Column({ name: 'recipient_last_name', nullable: true })
  recipientLastName: string;

  @Column({ name: 'recipient_phone_whatsapp', nullable: true })
  recipientPhoneWhatsapp: string;

  @Column({ name: 'recipient_whatsapp', nullable: true })
  recipientWhatsapp: string;

  // School fields
  @Column({ name: 'school_grade', nullable: true })
  schoolGrade: string;

  @Column({ name: 'school_name', nullable: true })
  schoolName: string;

  @Column({ name: 'school_syllabus', nullable: true })
  schoolSyllabus: string;

  @Column({ name: 'school_syllabus_other', nullable: true })
  schoolSyllabusOther: string;

  @Column({ name: 'school_type', nullable: true })
  schoolType: string;

  @Column({ name: 'street_address', type: 'text', nullable: true })
  streetAddress: string;

  // Student fields
  @Column({ name: 'student_email' })
  studentEmail: string;

  @Column({ name: 'student_first_name' })
  studentFirstName: string;

  @Column({ name: 'student_gender', nullable: true })
  studentGender: string;

  @Column({ name: 'student_last_name' })
  studentLastName: string;

  @Column({ name: 'student_phone_whatsapp', nullable: true })
  studentPhoneWhatsapp: string;

  // Swapout fields
  @Column({ name: 'swapout', type: 'boolean', default: false })
  swapout: boolean;

  // Tertiary fields
  @Column({ name: 'tertiary_course_years_list_nums', type: 'text', nullable: true })
  tertiaryCourseYearsListNums: string;

  @Column({ name: 'tertiary_study_guide_url', type: 'text', nullable: true })
  tertiaryStudyGuideUrl: string;

  @Column({ name: 'tertiary_topics_list', type: 'text', nullable: true })
  tertiaryTopicsList: string;

  // Tutor fields
  @Column({ name: 'tutor_for', nullable: true })
  tutorFor: string;

  @Column({ name: 'tutoring_start_period', nullable: true })
  tutoringStartPeriod: string;

  @Column({ name: 'tutoring_type', nullable: true })
  tutoringType: string;

  @Column({ name: 'tutors_assigned_list', type: 'text', nullable: true })
  tutorsAssignedList: string;

  @Column({ name: 'tutors_hourly_rate_list', type: 'text', nullable: true })
  tutorsHourlyRateList: string;

  @Column({ name: 'tutors_notified_num', type: 'int', nullable: true })
  tutorsNotifiedNum: number;

  // User fields
  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Column({ name: 'user_type', nullable: true })
  userType: string;

  // Audit fields
  @CreateDateColumn({ name: 'creation_date' })
  creationDate: Date;

  @UpdateDateColumn({ name: 'modified_date' })
  modifiedDate: Date;

  @Column({ name: 'slug', nullable: true })
  slug: string;

  @Column({ name: 'creator', nullable: true })
  creator: string;

  // Relations
  @ManyToOne(() => TertiaryName, (tertiaryName) => tertiaryName.tutorRequests)
  @JoinColumn({ name: 'institute_name', referencedColumnName: 'tertiaryName' })
  institute: TertiaryName;

  @ManyToOne(() => SchoolName, (schoolName) => schoolName.tutorRequests)
  @JoinColumn({ name: 'school_name', referencedColumnName: 'schoolNames' })
  school: SchoolName;

  @ManyToOne(() => BursaryName, (bursaryName) => bursaryName.tutorRequests)
  @JoinColumn({ name: 'bursary_name', referencedColumnName: 'bursaryName' })
  bursary: BursaryName;

  @ManyToOne(() => PromoCode, (promoCode) => promoCode.tutorRequests)
  @JoinColumn({ name: 'promo_code', referencedColumnName: 'promoCode' })
  promoCodeEntity: PromoCode;

  @OneToMany(() => TutorSessionsOrder, (tutorSessionsOrder) => tutorSessionsOrder.request)
  tutorSessionsOrders: TutorSessionsOrder[];

  @OneToMany(() => TutorJobNotification, (tutorJobNotification) => tutorJobNotification.request)
  tutorJobNotifications: TutorJobNotification[];

  @OneToMany(() => TutorStudentHour, (tutorStudentHour) => tutorStudentHour.request)
  tutorStudentHours: TutorStudentHour[];

  @OneToMany(() => StudentLesson, (studentLesson) => studentLesson.request)
  studentLessons: StudentLesson[];
}
