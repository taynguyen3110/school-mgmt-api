import { AuthUserModel } from "@jasonai/api/lib/server/types";
import { dbInstance } from "./db";
import { ClassType, ClassTypeFull, Parent, StudenFull, Student, Subject, SubjectFull, Teacher, User } from "./types";
import { Auth, Document, WithId } from 'mongodb';

// ## User
export const user_login = async (username: string, password: string) => {
    const db = await dbInstance.connect();
    if (!db) throw new Error('Database connection failed');
    
    const users = db.collection('users');
    const result = await users.findOne({ email: username, password: password });
    return result;
}

// export const user_list = (page = 1, rowsPerPage = 10) => {
//     const list = dbInstance.db.users;
//     const arr = Object.values(list);
//     const result = arr.slice((page - 1) * rowsPerPage, page * rowsPerPage);
//     return result;
// }

export const user_by_id = async (id: string) => {
    const db = await dbInstance.connect();
    if (!db) throw new Error('Database connection failed');
    
    const users = db.collection('users');
    return await users.findOne<AuthUserModel | Promise<AuthUserModel | undefined> | undefined>({ id: id });
}

export const user_add = async (user: User) => {
    const db = await dbInstance.connect();
    if (!db) throw new Error('Database connection failed');
    
    const users = db.collection('users');
    await users.insertOne(user);
}

export const user_update = async (user: User) => {
    const db = await dbInstance.connect();
    if (!db) throw new Error('Database connection failed');
    
    const users = db.collection('users');
    await users.updateOne(
        { id: user.id },
        { $set: user }
    );
}

// ## Class
const classesFull = async (classes: ClassType[]): Promise<ClassTypeFull[]> => {
    const db = await dbInstance.connect();
    if (!db) throw new Error('Database connection failed');
    
    const students = db.collection('students');
    const studentsData = await students.find({}).toArray();
    const studentsMap = new Map(
        studentsData
            .map(s => [s.id, s as unknown as Student])
    );

    return classes.map((classs) => ({
        ...classs,
        students: classs.studentIds
            .map((studentId) => studentsMap.get(studentId))
            .filter((student): student is Student => student !== undefined),
    }));
}

export const class_list = async (page = 1, rowsPerPage = 10) => {
    const db = await dbInstance.connect();
    if (!db) throw new Error('Database connection failed');
    
    const classes = db.collection('classes');
    const result = await classes.find({})
        .skip((page - 1) * rowsPerPage)
        .limit(rowsPerPage)
        .toArray();
    return result.map(doc => doc as unknown as ClassType);
}

export const class_filter = async (filter: { name?: string, page?: number, sortBy?: keyof ClassType, order?: 'asc' | 'desc' }, all = false) => {
    const { name, page, sortBy, order } = filter;
    const rowsPerPage = 10;
    const _page = page || 1;
    const _order = order || 'asc';

    const db = await dbInstance.connect();
    if (!db) throw new Error('Database connection failed');
    
    const classes = db.collection('classes');
    let query = classes.find({});

    if (name) {
        query = query.filter({ name: { $regex: name, $options: 'i' } });
    }

    if (sortBy) {
        query = query.sort({ [sortBy]: _order === 'desc' ? -1 : 1 });
    }

    const totalResult = await classes.countDocuments();
    
    if (!all) {
        query = query.skip((_page - 1) * rowsPerPage).limit(rowsPerPage);
    }

    const result = await query.toArray();
    const typedResult = result.map(doc => doc as unknown as ClassType);

    return {
        classes: typedResult,
        total: totalResult,
        rowsPerPage,
        page: _page,
        totalPages: Math.ceil(totalResult / rowsPerPage),
        filter: { name, page: _page, sortBy, order: _order }
    };
}

export const class_by_id = async (id: string) => {
    const db = await dbInstance.connect();
    if (!db) throw new Error('Database connection failed');
    
    const classes = db.collection('classes');
    const classData = await classes.findOne({ id: id });
    if (!classData) return undefined;

    return (await classesFull([{id: classData._id.toString(), name: classData.name as string, studentIds: classData.studentIds as string[]}]))[0];
}

export const class_add = async (classs: ClassType) => {
    const db = await dbInstance.connect();
    if (!db) throw new Error('Database connection failed');
    
    const classes = db.collection('classes');
    await classes.insertOne(classs);
    return classs;
}

export const class_update = async (classs: ClassType) => {
    const db = await dbInstance.connect();
    if (!db) throw new Error('Database connection failed');
    
    const classes = db.collection('classes');
    await classes.updateOne(
        { id: classs.id },
        { $set: classs }
    );
    return classs;
}

export const class_delete = async (id: string) => {
    const db = await dbInstance.connect();
    if (!db) throw new Error('Database connection failed');
    
    const classes = db.collection('classes');
    await classes.deleteOne({ id: id });
}

// ## Subject
// export const subject_list = (page = 1, rowsPerPage = 10) => {
//     const list = dbInstance.db.subjects;
//     const arr = Object.values(list);
//     const result = arr.slice((page - 1) * rowsPerPage, page * rowsPerPage);
//     return result;
// }

const subjectsFull = async (subjects: Subject[]): Promise<SubjectFull[]> => {
    const db = await dbInstance.connect();
    if (!db) throw new Error('Database connection failed');
    
    const teachers = db.collection('teachers');
    const classes = db.collection('classes');
    
    const teacherData = await teachers.find({}).toArray();
    const classData = await classes.find({}).toArray();
    
    const teachersMap = new Map(teacherData.map(t => [t.id, t as unknown as Teacher]));
    const classesMap = new Map(classData.map(c => [c.id, c as unknown as ClassType]));

    return subjects.map((subject) => {
        const teacher = teachersMap.get(subject.teacherId);
        const classData = classesMap.get(subject.classId);
        
        if (!teacher || !classData) {
            throw new Error(`Missing teacher or class data for subject ${subject.id}`);
        }

        return {
            ...subject,
            teacher,
            class: classData
        };
    });
}

export const subject_filter = async (filter: { name?: string, classIds?: string[], schedule?: string, page?: number, sortBy?: keyof Subject, order?: 'asc' | 'desc' }, all = false) => {
    const { name, classIds, schedule, order, page, sortBy } = filter;
    const rowsPerPage = 10;
    const _page = page || 1;
    const _order = order || 'asc';

    const db = await dbInstance.connect();
    if (!db) throw new Error('Database connection failed');
    
    const subjects = db.collection('subjects');
    let query = subjects.find({});

    if (name) {
        query = query.filter({ name: { $regex: name, $options: 'i' } });
    }

    if (classIds && classIds.length) {
        query = query.filter({ classId: { $in: classIds } });
    }

    if (schedule) {
        query = query.filter({ daysOfWeek: schedule.toLowerCase() });
    }

    if (sortBy) {
        query = query.sort({ [sortBy]: _order === 'desc' ? -1 : 1 });
    }

    const totalResult = await subjects.countDocuments();
    
    if (!all) {
        query = query.skip((_page - 1) * rowsPerPage).limit(rowsPerPage);
    }

    const result = await query.toArray();
    const typedResult = result.map(doc => doc as unknown as Subject);
    const subjectsWithDetails = await subjectsFull(typedResult);

    return {
        subjects: subjectsWithDetails,
        total: totalResult,
        rowsPerPage,
        page: _page,
        totalPages: Math.ceil(totalResult / rowsPerPage),
        filter: { name, classIds, page: _page, sortBy, order: _order }
    };
}

export const subject_by_id = async (id: string) => {
    const db = await dbInstance.connect();
    if (!db) throw new Error('Database connection failed');
    
    const subjects = db.collection('subjects');
    const subject = await subjects.findOne({ id: id });
    if (!subject) return undefined;

    return (await subjectsFull([subject as unknown as Subject]))[0];
}

export const subject_add = async (subject: Subject) => {
    const db = await dbInstance.connect();
    if (!db) throw new Error('Database connection failed');
    
    const subjects = db.collection('subjects');
    await subjects.insertOne(subject);
    const result = await subjectsFull([subject]);
    return result[0];
}

export const subject_update = async (subject: Subject) => {
    const db = await dbInstance.connect();
    if (!db) throw new Error('Database connection failed');
    
    const subjects = db.collection('subjects');
    await subjects.updateOne(
        { id: subject.id },
        { $set: subject }
    );
    const result = await subjectsFull([subject]);
    return result[0];
}

export const subject_delete = async (id: string) => {
    const db = await dbInstance.connect();
    if (!db) throw new Error('Database connection failed');
    
    const subjects = db.collection('subjects');
    await subjects.deleteOne({ id: id });
}

// ## Teacher
// export const teacher_list = (page = 1, rowsPerPage = 10) => {
//     const list = dbInstance.db.teachers;
//     const arr = Object.values(list);
//     const result = arr.slice((page - 1) * rowsPerPage, page * rowsPerPage);
//     return result;
// }

export const teacher_filter = async (filter: { name?: string, classIds?: string[], page?: number, sortBy?: keyof Teacher, order?: 'asc' | 'desc' }, all = false) => {
    const { name, classIds, page, sortBy, order } = filter;
    const rowsPerPage = 10;
    const _page = page || 1;
    const _order = order || 'asc';

    const db = await dbInstance.connect();
    if (!db) throw new Error('Database connection failed');
    
    const teachers = db.collection('teachers');
    let query = teachers.find({});

    if (name) {
        query = query.filter({
            $or: [
                { firstName: { $regex: name, $options: 'i' } },
                { lastName: { $regex: name, $options: 'i' } }
            ]
        });
    }

    if (classIds && classIds.length) {
        const subjects = db.collection('subjects');
        const subjectData = await subjects.find({ classId: { $in: classIds } }).toArray();
        const teacherIds = subjectData.map(subject => subject.teacherId);
        query = query.filter({ id: { $in: teacherIds } });
    }

    if (sortBy) {
        query = query.sort({ [sortBy]: _order === 'desc' ? -1 : 1 });
    }

    const totalResult = await teachers.countDocuments();
    
    if (!all) {
        query = query.skip((_page - 1) * rowsPerPage).limit(rowsPerPage);
    }

    const result = await query.toArray();
    const typedResult = result.map(doc => doc as unknown as Teacher);

    return {
        teachers: typedResult,
        total: totalResult,
        rowsPerPage,
        page: _page,
        totalPages: Math.ceil(totalResult / rowsPerPage),
        filter: { name, classIds, page: _page, sortBy, order: _order }
    };
}

export const teacher_by_id = async (id: string) => {
    const db = await dbInstance.connect();
    if (!db) throw new Error('Database connection failed');
    
    const teachers = db.collection('teachers');
    const teacher = await teachers.findOne({ id: id });
    if (!teacher) return undefined;

    return teacher as unknown as Teacher;
}

export const teacher_add = async (teacher: Teacher) => {
    const db = await dbInstance.connect();
    if (!db) throw new Error('Database connection failed');
    
    const teachers = db.collection('teachers');
    await teachers.insertOne(teacher);
    return teacher;
}

export const teacher_update = async (teacher: Teacher) => {
    const db = await dbInstance.connect();
    if (!db) throw new Error('Database connection failed');
    
    const teachers = db.collection('teachers');
    await teachers.updateOne(
        { id: teacher.id },
        { $set: teacher }
    );
    return teacher;
}

export const teacher_delete = async (id: string) => {
    const db = await dbInstance.connect();
    if (!db) throw new Error('Database connection failed');
    
    const teachers = db.collection('teachers');
    await teachers.deleteOne({ id: id });
}

// ## Parent
// export const parent_list = (page = 1, rowsPerPage = 10) => {
//     const list = dbInstance.db.parents;
//     const arr = Object.values(list);
//     const result = arr.slice((page - 1) * rowsPerPage, page * rowsPerPage);
//     return result;
// }

export const parent_filter = async (filter: { name?: string, classIds?: string[], page?: number, sortBy?: keyof Parent, order?: 'asc' | 'desc' }, all = false) => {
    const { name, classIds, page, sortBy, order } = filter;
    const rowsPerPage = 10;
    const _page = page || 1;
    const _order = order || 'asc';

    const db = await dbInstance.connect();
    if (!db) throw new Error('Database connection failed');
    
    const parents = db.collection('parents');
    let query = parents.find({});

    if (name) {
        query = query.filter({
            $or: [
                { firstName: { $regex: name, $options: 'i' } },
                { lastName: { $regex: name, $options: 'i' } }
            ]
        });
    }

    if (classIds && classIds.length) {
        const students = db.collection('students');
        const studentData = await students.find({ classIds: { $in: classIds } }).toArray();
        const parentIds = studentData.flatMap(student => student.parentIds);
        query = query.filter({ id: { $in: parentIds } });
    }

    if (sortBy) {
        query = query.sort({ [sortBy]: _order === 'desc' ? -1 : 1 });
    }

    const totalResult = await parents.countDocuments();
    
    if (!all) {
        query = query.skip((_page - 1) * rowsPerPage).limit(rowsPerPage);
    }

    const result = await query.toArray();
    const typedResult = result.map(doc => doc as unknown as Parent);

    return {
        parents: typedResult,
        total: totalResult,
        rowsPerPage,
        page: _page,
        totalPages: Math.ceil(totalResult / rowsPerPage),
        filter: { name, classIds, page: _page, sortBy, order: _order }
    };
}

export const parent_by_id = async (id: string) => {
    const db = await dbInstance.connect();
    if (!db) throw new Error('Database connection failed');
    
    const parents = db.collection('parents');
    const parent = await parents.findOne({ id: id });
    if (!parent) return undefined;

    return parent as unknown as Parent;
}

export const parent_add = async (parent: Parent) => {
    const db = await dbInstance.connect();
    if (!db) throw new Error('Database connection failed');
    
    const parents = db.collection('parents');
    await parents.insertOne(parent);
    return parent;
}

export const parent_delete = async (id: string) => {
    const db = await dbInstance.connect();
    if (!db) throw new Error('Database connection failed');
    
    const parents = db.collection('parents');
    await parents.deleteOne({ id: id });
}

export const parent_update = async (parent: Parent) => {
    const db = await dbInstance.connect();
    if (!db) throw new Error('Database connection failed');
    
    const parents = db.collection('parents');
    await parents.updateOne(
        { id: parent.id },
        { $set: parent }
    );
    return parent;
}

// ## Student
// export const student_list = (page = 1, rowsPerPage = 10) => {
//     const list = dbInstance.db.students;
//     // convert to array
//     const arr = Object.values(list);
//     const result = arr.slice((page - 1) * rowsPerPage, page * rowsPerPage);
//     return result;
// }

const studentsFull = async (students: Student[]): Promise<StudenFull[]> => {
    const db = await dbInstance.connect();
    if (!db) throw new Error('Database connection failed');
    
    const parents = db.collection('parents');
    const classes = db.collection('classes');
    
    const parentData = await parents.find({}).toArray();
    const classData = await classes.find({}).toArray();
    
    const parentsMap = new Map(parentData.map(p => [p.id, p as unknown as Parent]));
    const classesMap = new Map(classData.map(c => [c.id, c as unknown as ClassType]));

    return students.map((student) => ({
        ...student,
        parents: student.parentIds
            .map((parentId) => parentsMap.get(parentId))
            .filter((parent): parent is Parent => parent !== undefined),
        classes: student.classIds
            .map((classId) => classesMap.get(classId))
            .filter((classs): classs is ClassType => classs !== undefined)
    }));
}

export const student_by_parent = async (parentId: string) => {
    const db = await dbInstance.connect();
    if (!db) throw new Error('Database connection failed');
    
    const students = db.collection('students');
    const result = await students.find({ parentIds: parentId }).toArray();
    const typedResult = result.map(doc => doc as unknown as Student);
    return await studentsFull(typedResult);
}

export const student_filter = async (filter: { name?: string, classIds?: string[], page?: number, sortBy?: keyof Student, order?: 'asc' | 'desc' }, all = false) => {
    const { name, classIds, page, sortBy, order } = filter;
    const rowsPerPage = 10;
    const _page = page || 1;
    const _order = order || 'asc';

    const db = await dbInstance.connect();
    if (!db) throw new Error('Database connection failed');
    
    const students = db.collection('students');
    let query = students.find({});

    if (name) {
        query = query.filter({
            $or: [
                { firstName: { $regex: name, $options: 'i' } },
                { lastName: { $regex: name, $options: 'i' } }
            ]
        });
    }

    if (classIds && classIds.length) {
        query = query.filter({ classIds: { $in: classIds } });
    }

    if (sortBy) {
        query = query.sort({ [sortBy]: _order === 'desc' ? -1 : 1 });
    }

    const totalResult = await students.countDocuments();
    
    if (!all) {
        query = query.skip((_page - 1) * rowsPerPage).limit(rowsPerPage);
    }

    const result = await query.toArray();
    const typedResult = result.map(doc => doc as unknown as Student);
    const studentsWithDetails = await studentsFull(typedResult);

    return {
        students: studentsWithDetails,
        total: totalResult,
        rowsPerPage,
        page: _page,
        totalPages: Math.ceil(totalResult / rowsPerPage),
        filter: { name, classIds, page: _page, sortBy, order: _order }
    };
}

export const student_by_id = async (id: string) => {
    const db = await dbInstance.connect();
    if (!db) throw new Error('Database connection failed');
    
    const students = db.collection('students');
    const student = await students.findOne({ id: id });
    if (!student) return undefined;

    const result = await studentsFull([student as unknown as Student]);
    return result[0];
}

export const student_add = async (student: Student) => {
    const db = await dbInstance.connect();
    if (!db) throw new Error('Database connection failed');
    
    const students = db.collection('students');
    await students.insertOne(student);
    const result = await studentsFull([student]);
    return result[0];
}

export const student_delete = async (id: string) => {
    const db = await dbInstance.connect();
    if (!db) throw new Error('Database connection failed');
    
    const students = db.collection('students');
    await students.deleteOne({ id: id });
}

export const student_update = async (student: Student) => {
    const db = await dbInstance.connect();
    if (!db) throw new Error('Database connection failed');
    
    const students = db.collection('students');
    await students.updateOne(
        { id: student.id },
        { $set: student }
    );
    const result = await studentsFull([student]);
    return result[0];
}

export const db_stats = async () => {
    const db = await dbInstance.connect();
    if (!db) throw new Error('Database connection failed');
    
    const students = db.collection('students');
    const parents = db.collection('parents');
    const teachers = db.collection('teachers');
    const classes = db.collection('classes');

    // Get counts using MongoDB's countDocuments
    const [studentCount, parentCount, teacherCount, classCount] = await Promise.all([
        students.countDocuments(),
        parents.countDocuments(),
        teachers.countDocuments(),
        classes.countDocuments()
    ]);

    // Get gender counts using MongoDB's aggregation
    const genderStats = await students.aggregate([
        {
            $group: {
                _id: '$gender',
                count: { $sum: 1 }
            }
        }
    ]).toArray();

    const maleCount = genderStats.find(stat => stat._id === 'male')?.count || 0;
    const femaleCount = genderStats.find(stat => stat._id === 'female')?.count || 0;

    // Get enrollments per year using MongoDB's aggregation
    const enrollmentsPerYear = await students.aggregate([
        {
            $group: {
                _id: { $substr: ['$admissionDate', 0, 4] },
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                year: '$_id',
                count: 1,
                _id: 0
            }
        },
        {
            $sort: { year: 1 }
        }
    ]).toArray();

    return {
        studentCount,
        maleCount,
        femaleCount,
        parentCount,
        teacherCount,
        classCount,
        enrollmentsPerYear: enrollmentsPerYear.map(stat => [stat.year, stat.count])
    };
}