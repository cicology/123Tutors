import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Course } from '../courses/courses.entity';

@Entity('lessons')
export class Lesson {
  @PrimaryColumn({ name: 'unique_id' })
  uniqueId: string;

  @Column({ name: 'title' })
  title: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'course_id', nullable: true })
  courseId: string;

  @Column({ name: 'course_name', nullable: true })
  courseName: string;

  @Column({ name: 'duration', type: 'int' })
  duration: number; // in minutes

  @Column({ name: 'students_enrolled', type: 'int', default: 0 })
  studentsEnrolled: number;

  @Column({ name: 'completion_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  completionRate: number;

  @Column({ name: 'status', default: 'draft' })
  status: 'published' | 'draft' | 'archived';

  @Column({ name: 'lesson_date', type: 'timestamp', nullable: true })
  lessonDate: Date;

  @Column({ name: 'lesson_location', nullable: true })
  lessonLocation: string;

  @Column({ name: 'lesson_type', nullable: true })
  lessonType: string; // online, in-person, hybrid

  @Column({ name: 'instructor_name', nullable: true })
  instructorName: string;

  @Column({ name: 'max_students', type: 'int', nullable: true })
  maxStudents: number;

  @Column({ name: 'price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ name: 'bursary_name', nullable: true })
  bursaryName: string;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

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
  @ManyToOne(() => Course, (course) => course.uniqueId)
  @JoinColumn({ name: 'course_id', referencedColumnName: 'uniqueId' })
  course: Course;
}

