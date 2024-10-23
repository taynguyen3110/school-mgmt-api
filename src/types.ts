import z from "zod";

export const UserSchema = z.object({
    id: z.string(),
    lastName: z.string(),
    firstName: z.string(),
    email: z.string(),
    password: z.string(),
    role: z.string(),
    isBlocked: z.boolean(),
    profileUrl: z.string(),
});

export const UserUpdateDataSchema = UserSchema.omit({ id: true, password: true });
export type UserUpdateData = z.infer<typeof UserUpdateDataSchema>;

export type User = z.infer<typeof UserSchema>;

export const ClassSchema = z.object({
    id: z.string(),
    name: z.string(),
    studentIds: z.array(z.string()),
});

export type ClassType = z.infer<typeof ClassSchema>;
export type ClassTypeFull = ClassType & { students: Student[] };
export const ClassUpdateDataSchema = ClassSchema.omit({ id: true });
export type ClassUpdateData = z.infer<typeof ClassUpdateDataSchema>;

export const SubjectSchema = z.object({
    id: z.string(),
    name: z.string(),
    teacherId: z.string(),
    classId: z.string(),
    daysOfWeek: z.array(z.string()),
});

export const SubjectUpdateDataSchema = SubjectSchema.omit({ id: true });
export type SubjectUpdateData = z.infer<typeof SubjectUpdateDataSchema>;

export type Subject = z.infer<typeof SubjectSchema>;
export type SubjectFull = Subject & { teacher: Teacher, class: ClassType };

export const TeacherSchema = z.object({
    id: z.string(),
    lastName: z.string(),
    firstName: z.string(),
    address: z.string(),
    email: z.string(),
    gender: z.string(),
    phone: z.string(),
    profileUrl: z.string(),
    admissionDate: z.string(),
});

export const TeacherUpdateDataSchema = TeacherSchema.omit({ id: true });
export type TeacherUpdateData = z.infer<typeof TeacherUpdateDataSchema>;

export type Teacher = z.infer<typeof TeacherSchema>;

export const ParentSchema = z.object({
    id: z.string(),
    lastName: z.string(),
    firstName: z.string(),
    address: z.string(),
    email: z.string(),
    phone: z.string(),
    profileUrl: z.string(),
});

export const ParentUpdateDataSchema = ParentSchema.omit({ id: true });
export type ParentUpdateData = z.infer<typeof ParentUpdateDataSchema>;

export type Parent = z.infer<typeof ParentSchema>;

export const StudentSchema = z.object({
    id: z.string(),
    lastName: z.string(),
    firstName: z.string(),
    address: z.string(),
    email: z.string(),
    profileUrl: z.string(),
    gender: z.string(),
    dateOfBirth: z.string(),
    classIds: z.array(z.string()),
    parentIds: z.array(z.string()),
    admissionDate: z.string(),
    phone: z.string(),
});

// student data omit id
export const StudentUpdateDataSchema = StudentSchema.omit({ id: true });
export type StudentUpdateData = z.infer<typeof StudentUpdateDataSchema>;

export type Student = z.infer<typeof StudentSchema>;
export type StudenFull = Student & { parents: Parent[], classes: ClassType[] };

export const DbScema = z.object({
    users: z.record(UserSchema),
    classes: z.record(ClassSchema),
    subjects: z.record(SubjectSchema),
    teachers: z.record(TeacherSchema),
    parents: z.record(ParentSchema),
    students: z.record(StudentSchema),
});

export type Db = z.infer<typeof DbScema>;