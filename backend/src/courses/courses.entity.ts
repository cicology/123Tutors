import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('courses')
export class Course {
  @PrimaryColumn({ name: 'unique_id' })
  uniqueId: string;

  @Column({ name: 'institute_name', nullable: true })
  instituteName: string;

  @Column({ name: 'module_code_name_search', nullable: true })
  moduleCodeNameSearch: string;

  @Column({ name: 'module_description', type: 'text', nullable: true })
  moduleDescription: string;

  @Column({ name: 'module_year', type: 'int', nullable: true })
  moduleYear: number;

  @Column({ name: 'module_code', nullable: true })
  moduleCode: string;

  @Column({ name: 'module_name', nullable: true })
  moduleName: string;

  @Column({ name: 'skill_category', nullable: true })
  skillCategory: string;

  @Column({ name: 'skill_name', nullable: true })
  skillName: string;

  @Column({ name: 'subject_name', nullable: true })
  subjectName: string;

  @CreateDateColumn({ name: 'creation_date' })
  creationDate: Date;

  @UpdateDateColumn({ name: 'modified_date' })
  modifiedDate: Date;

  @Column({ name: 'slug', nullable: true })
  slug: string;

  @Column({ name: 'creator', nullable: true })
  creator: string;

  @Column({ name: 'module_level', nullable: true })
  moduleLevel: string;

  @Column({ name: 'module_credits', type: 'int', nullable: true })
  moduleCredits: number;
}
