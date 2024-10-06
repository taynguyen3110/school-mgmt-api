import { dbInstance } from "./db";
import { ClassType, Parent, StudenFull, Student, Subject, SubjectFull, Teacher } from "./types";

// ## User
export const user_login = (username: string, password: string) => {
    const list = dbInstance.db.users;
    const arr = Object.values(list);
    const result = arr.find((user) => user.email === username && user.password === password);
    return result;
}

// export const user_list = (page = 1, rowsPerPage = 10) => {
//     const list = dbInstance.db.users;
//     const arr = Object.values(list);
//     const result = arr.slice((page - 1) * rowsPerPage, page * rowsPerPage);
//     return result;
// }

export const user_by_id = (id: string) => {
    return dbInstance.db.users[id];
}

export const user_add = (user: any) => {
    dbInstance.db.users[user.id] = user;
    dbInstance.write();
}

export const user_update = (user: any) => {
    dbInstance.db.users[user.id] = user;
    dbInstance.write();
}

// ## Class
export const class_list = (page = 1, rowsPerPage = 10) => {
    const list = dbInstance.db.classes;
    const arr = Object.values(list);
    const result = arr.slice((page - 1) * rowsPerPage, page * rowsPerPage);
    return result;
}

export const class_by_id = (id: string) => {
    return dbInstance.db.classes[id];
}

export const class_add = (classs: ClassType) => {
    dbInstance.db.classes[classs.id] = classs;
    dbInstance.write();
}

export const class_update = (classs: ClassType) => {
    dbInstance.db.classes[classs.id] = classs;
    dbInstance.write();
}

// ## Subject
// export const subject_list = (page = 1, rowsPerPage = 10) => {
//     const list = dbInstance.db.subjects;
//     const arr = Object.values(list);
//     const result = arr.slice((page - 1) * rowsPerPage, page * rowsPerPage);
//     return result;
// }

const subjectsFull = (subjects: Subject[]): SubjectFull[] => {
    const teachers = dbInstance.db.teachers;
    return subjects.map((subject) => {
        return {
            ...subject,
            teacher: teachers[subject.teacherId],
            class: dbInstance.db.classes[subject.classId]
        }
    });
}

export const subject_filter = (filter: { name?: string, classIds?: string[], page?: number, sortBy?: keyof Subject, order?: 'asc' | 'desc' }) => {
    const { name, classIds, order, page, sortBy } = filter;
    const rowsPerPage = 10;
    const _page = page || 1;
    const _order = order || 'asc';
    const list = dbInstance.db.subjects;
    const arr = Object.values(list);
    let result = arr;
    if (name) {
        const nameLower = name.toLowerCase();
        result = result.filter((subject) => subject.name.toLowerCase().includes(nameLower));
    }
    if (classIds && classIds.length) {
        result = result.filter((subject) => classIds.includes(subject.classId));
    }
    if (sortBy) {
        result = result.sort((a, b) => {
            if (a[sortBy] < b[sortBy]) return -1;
            if (a[sortBy] > b[sortBy]) return 1;
            return 0;
        });
        // order
        if (_order === 'desc') {
            result = result.reverse();
        }
    }

    const totalResult = result.length;
    if (_page) {
        result = result.slice((_page - 1) * rowsPerPage, _page * rowsPerPage);
    }
    return {
        subjects: subjectsFull(result),
        total: totalResult,
        rowsPerPage,
        page: _page,
        totalPages: Math.ceil(totalResult / rowsPerPage),
        filter: { name, classIds, page: _page, sortBy, order: _order }
    };
}

export const subject_by_id = (id: string) => {
    if (!dbInstance.db.subjects[id]) return undefined;
    return subjectsFull([dbInstance.db.subjects[id]])[0];
}

export const subject_add = (subject: Subject) => {
    dbInstance.db.subjects[subject.id] = subject;
    dbInstance.write();
    return subjectsFull([dbInstance.db.subjects[subject.id]])[0];
}

export const subject_update = (subject: Subject) => {
    dbInstance.db.subjects[subject.id] = subject;
    dbInstance.write();
    return subjectsFull([dbInstance.db.subjects[subject.id]])[0];
}

export const subject_delete = (id: string) => {
    delete dbInstance.db.subjects[id];
    dbInstance.write();
}

// ## Teacher
// export const teacher_list = (page = 1, rowsPerPage = 10) => {
//     const list = dbInstance.db.teachers;
//     const arr = Object.values(list);
//     const result = arr.slice((page - 1) * rowsPerPage, page * rowsPerPage);
//     return result;
// }

export const teacher_filter = (filter: { name?: string, classIds?: string[], page?: number, sortBy?: keyof Teacher, order?: 'asc' | 'desc' }) => {
    const { name, classIds, page, sortBy, order } = filter;
    const rowsPerPage = 10;
    const _page = page || 1;
    const _order = order || 'asc';
    const list = dbInstance.db.teachers;
    const arr = Object.values(list);
    let result = arr;
    if (name) {
        const nameLower = name.toLowerCase();
        result = result.filter((teacher) => teacher.firstName.toLowerCase().includes(nameLower)
            || teacher.lastName.toLowerCase().includes(nameLower));
    }
    if (classIds && classIds.length) {
        const subjects = dbInstance.db.subjects;
        result = result.filter((teacher) => {
            const subject = Object.values(subjects).find((subject) => subject.teacherId === teacher.id);
            return subject && classIds.includes(subject.classId);
        });
    }
    if (sortBy) {
        result = result.sort((a, b) => {
            if (a[sortBy] < b[sortBy]) return -1;
            if (a[sortBy] > b[sortBy]) return 1;
            return 0;
        });
        // order
        if (_order === 'desc') {
            result = result.reverse();
        }
    }
    const totalResult = result.length;
    if (_page) {
        result = result.slice((_page - 1) * rowsPerPage, _page * rowsPerPage);
    }

    return {
        teachers: result,
        total: totalResult,
        rowsPerPage,
        page: _page,
        totalPages: Math.ceil(totalResult / rowsPerPage),
        filter: { name, classIds, page: _page, sortBy, order: _order }
    };
}

export const teacher_by_id = (id: string) => {
    return dbInstance.db.teachers[id];
}

export const teacher_add = (teacher: Teacher) => {
    dbInstance.db.teachers[teacher.id] = teacher;
    dbInstance.write();
    return dbInstance.db.teachers[teacher.id];
}

export const teacher_update = (teacher: Teacher) => {
    dbInstance.db.teachers[teacher.id] = teacher;
    dbInstance.write();
    return dbInstance.db.teachers[teacher.id];
}

export const teacher_delete = (id: string) => {
    delete dbInstance.db.teachers[id];
    dbInstance.write();
}

// ## Parent
// export const parent_list = (page = 1, rowsPerPage = 10) => {
//     const list = dbInstance.db.parents;
//     const arr = Object.values(list);
//     const result = arr.slice((page - 1) * rowsPerPage, page * rowsPerPage);
//     return result;
// }

export const parent_filter = (filter: { name?: string, classIds?: string[], page?: number, sortBy?: keyof Parent, order?: 'asc' | 'desc' }) => {
    const { name, classIds, page, sortBy, order } = filter;
    const rowsPerPage = 10;
    const _page = page || 1;
    const _order = order || 'asc';
    const list = dbInstance.db.parents;
    const arr = Object.values(list);
    let result = arr;
    if (name) {
        const nameLower = name.toLowerCase();
        result = result.filter((parent) => parent.firstName.toLowerCase().includes(nameLower)
            || parent.lastName.toLowerCase().includes(nameLower));
    }
    if (classIds && classIds.length) {
        const students = dbInstance.db.students;
        result = result.filter((parent) => {
            const student = Object.values(students).find((student) => student.parentIds.includes(parent.id));
            return student && !!student.classIds.find(classId => classIds.includes(classId));
        });
    }
    if (sortBy) {
        result = result.sort((a, b) => {
            if (a[sortBy] < b[sortBy]) return -1;
            if (a[sortBy] > b[sortBy]) return 1;
            return 0;
        });
        // order
        if (_order === 'desc') {
            result = result.reverse();
        }
    }
    const totalResult = result.length;
    if (_page) {
        result = result.slice((_page - 1) * rowsPerPage, _page * rowsPerPage);
    }

    return {
        parents: result,
        total: totalResult,
        rowsPerPage,
        page: _page,
        totalPages: Math.ceil(totalResult / rowsPerPage),
        filter: { name, classIds, page: _page, sortBy, order: _order }
    };
}

export const parent_by_id = (id: string) => {
    return dbInstance.db.parents[id];
}

export const parent_add = (parent: Parent) => {
    dbInstance.db.parents[parent.id] = parent;
    dbInstance.write();
    return dbInstance.db.parents[parent.id];
}

export const parent_delete = (id: string) => {
    delete dbInstance.db.parents[id];
    dbInstance.write();
}

export const parent_update = (parent: Parent) => {
    dbInstance.db.parents[parent.id] = parent;
    dbInstance.write();
    return dbInstance.db.parents[parent.id];
}

// ## Student
// export const student_list = (page = 1, rowsPerPage = 10) => {
//     const list = dbInstance.db.students;
//     // convert to array
//     const arr = Object.values(list);
//     const result = arr.slice((page - 1) * rowsPerPage, page * rowsPerPage);
//     return result;
// }

const studentsFull = (students: Student[]): StudenFull[] => {
    const parents = dbInstance.db.parents;
    const classes = dbInstance.db.classes;
    return students.map((student) => {
        return {
            ...student,
            parents: student.parentIds.map((parentId) => parents[parentId]),
            classes: student.classIds.map((classId) => classes[classId]),
        }
    });
}

export const student_by_parent = (parentId: string) => {
    const list = dbInstance.db.students;
    const arr = Object.values(list);
    const result = arr.filter((student) => student.parentIds.includes(parentId));
    return studentsFull(result);
}

export const student_filter = (filter: { name?: string, classIds?: string[], page?: number, sortBy?: keyof Student, order?: 'asc' | 'desc' }) => {
    const { name, classIds, page, sortBy, order } = filter;
    const rowsPerPage = 10;
    const _page = page || 1;
    const _order = order || 'asc';
    const list = dbInstance.db.students;
    const arr = Object.values(list);
    let result = arr;

    if (name) {
        const nameLower = name.toLowerCase();
        result = result.filter((student) => (student.firstName + student.lastName).toLowerCase().includes(nameLower));
    }
    if (classIds && classIds.length) {
        result = result.filter((student) => !!student.classIds.find(classId => classIds.includes(classId)));
    }
    if (sortBy) {
        result = result.sort((a, b) => {
            if (a[sortBy] < b[sortBy]) return -1;
            if (a[sortBy] > b[sortBy]) return 1;
            return 0;
        });
        // order
        if (_order === 'desc') {
            result = result.reverse();
        }
    }
    const totalResult = result.length;
    if (_page) {
        result = result.slice((_page - 1) * rowsPerPage, _page * rowsPerPage);
    }
    const students = studentsFull(result);

    return {
        students,
        total: totalResult,
        rowsPerPage,
        page: _page,
        totalPages: Math.ceil(totalResult / rowsPerPage),
        filter: { name, classIds, page: _page, sortBy, order: _order }
    }
}

export const student_by_id = (id: string) => {
    if (!dbInstance.db.students[id]) return undefined;

    return studentsFull([dbInstance.db.students[id]])[0];
}

export const student_add = (student: Student) => {
    dbInstance.db.students[student.id] = student;
    dbInstance.write();
    return studentsFull([dbInstance.db.students[student.id]])[0];
}

export const student_delete = (id: string) => {
    delete dbInstance.db.students[id];
    dbInstance.write();
}

export const student_update = (student: Student) => {
    dbInstance.db.students[student.id] = student;
    dbInstance.write();
    return studentsFull([dbInstance.db.students[student.id]])[0];
}