import { CreateServerOptions, getRequestBody, getRequestParams, getRequestQuery, HttpCallAuthentication, HttpCallValidation } from "@jasonai/api";
import { student_add, student_by_id, student_by_parent, student_delete, student_filter, student_update } from "./services";
import z from "zod";
import { StudentUpdateData, StudentUpdateDataSchema } from "./types";

export const studentController: CreateServerOptions['beforeRoute'] = (app) => {
    app.get('/api/students/lookup', HttpCallAuthentication().middleware(), HttpCallValidation(studentsQuerySchema).middleware('query'), async (req, res) => {
        // get students
        const { name, classIds, page, sortBy, order } = (getRequestQuery() || {}) as StudentQuery;
        const list = await student_filter({ name, classIds: (classIds?.split(',') || []), page: parseInt(page || '1'), sortBy: sortBy as any, order }, true);
        res.json(list);
        res.status(200);
    });
    app.get('/api/students/', HttpCallAuthentication().middleware(), HttpCallValidation(studentsQuerySchema).middleware('query'), async (req, res) => {
        // get students
        const { name, classIds, page, sortBy, order } = (getRequestQuery() || {}) as StudentQuery;
        const list = await student_filter({ name, classIds: (classIds?.split(',') || []), page: parseInt(page || '1'), sortBy: sortBy as any, order });
        res.json(list);
        res.status(200);
    });
    app.get('/api/students/:id', HttpCallAuthentication().middleware(), HttpCallValidation(studentsParamsSchema).middleware('params'), async (req, res) => {
        // get students
        const { id } = (getRequestParams() || {}) as StudentParams;
        const student = await student_by_id(id);
        res.json(student);
        res.status(200);
    });
    app.delete('/api/students/:id', HttpCallAuthentication().middleware(), HttpCallValidation(studentsParamsSchema).middleware('params'), async (req, res) => {
        // get students
        const { id } = (getRequestParams() || {}) as StudentParams;
        await student_delete(id);
        res.status(200).end();
    });
    app.post('/api/students/add', HttpCallAuthentication().middleware(), HttpCallValidation(StudentUpdateDataSchema).middleware('body'), async (req, res) => {
        const data = getRequestBody() as StudentUpdateData;
        // add student
        const student = await student_add({ id: 's' + Date.now(), ...data });
        res.json(student);
        res.status(200);
    });
    app.post('/api/students/:id', HttpCallAuthentication().middleware(), HttpCallValidation(StudentUpdateDataSchema).middleware('body'), HttpCallValidation(studentsParamsSchema).middleware('params'), async (req, res) => {
        const { id } = (getRequestParams() || {}) as StudentParams;
        const data = getRequestBody() as StudentUpdateData;
        // update student
        const record = await student_by_id(id);
        if (!record) {
            return res.status(404).json({
                code: 404,
                message: 'Not found'
            });
        }
        const student = await student_update({ id, ...data });
        res.json(student);
        res.status(200);
    });
    app.get('/api/students/by-parent/:id', HttpCallAuthentication().middleware(), HttpCallValidation(studentsParamsSchema).middleware('params'), async (req, res) => {
        // get students
        const { id } = (getRequestParams() || {}) as StudentParams;
        const students = await student_by_parent(id);
        res.json(students);
        res.status(200);
    });
}

const studentsQuerySchema = z.object({
    name: z.string().optional(),
    classIds: z.string().optional(),
    page: z.string().optional(),
    sortBy: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
});
type StudentQuery = z.infer<typeof studentsQuerySchema>;
const studentsParamsSchema = z.object({
    id: z.string()
});
type StudentParams = z.infer<typeof studentsParamsSchema>;