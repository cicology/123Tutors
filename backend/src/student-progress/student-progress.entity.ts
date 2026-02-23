import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BursaryStudent } from '../bursary-students/bursary-students.entity';
import { Course } from '../courses/courses.entity';

@Entity('student_progress')
export class StudentProgress {
  @PrimaryColumn({ name: 'unique_id' })
  uniqueId: string;

  @Column({ name: 'student_email' })
  studentEmail: string;

  @Column({ name: 'student_name' })
  studentName: string;

  @Column({ name: 'bursary_student_id', nullable: true })
  bursaryStudentId: string;

  @Column({ name: 'course_id', nullable: true })
  courseId: string;

  @Column({ name: 'course_name', nullable: true })
  courseName: string;

  @Column({ name: 'overall_progress', type: 'decimal', precision: 5, scale: 2, default: 0 })
  overallProgress: number;

  @Column({ name: 'gpa', type: 'decimal', precision: 3, scale: 2, nullable: true })
  gpa: number;

  @Column({ name: 'credits_completed', type: 'int', default: 0 })
  creditsCompleted: number;

  @Column({ name: 'total_credits', type: 'int', default: 120 })
  totalCredits: number;

  @Column({ name: 'attendance_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  attendancePercentage: number;

  @Column({ name: 'assignments_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  assignmentsPercentage: number;

  @Column({ name: 'exams_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  examsPercentage: number;

  @Column({ name: 'participation_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  participationPercentage: number;

  @Column({ name: 'status', default: 'active' })
  status: 'active' | 'inactive' | 'completed' | 'dropped';

  @Column({ name: 'enrollment_date', type: 'date' })
  enrollmentDate: Date;

  @Column({ name: 'completion_date', type: 'date', nullable: true })
  completionDate: Date;

  @Column({ name: 'bursary_name', nullable: true })
  bursaryName: string;

  @Column({ name: 'university', nullable: true })
  university: string;

  @Column({ name: 'year_of_study', type: 'int', nullable: true })
  yearOfStudy: number;

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
  @ManyToOne(() => BursaryStudent)
  @JoinColumn({ name: 'bursary_student_id', referencedColumnName: 'uniqueId' })
  student: BursaryStudent;

  @ManyToOne(() => Course, (course) => course.uniqueId)
  @JoinColumn({ name: 'course_id', referencedColumnName: 'uniqueId' })
  course: Course;
}
