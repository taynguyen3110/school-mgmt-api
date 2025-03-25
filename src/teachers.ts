import { CreateServerOptions, getRequestBody, getRequestParams, getRequestQuery, HttpCallAuthentication, HttpCallValidation } from "@jasonai/api";
import { teacher_add, teacher_by_id, teacher_delete, teacher_filter, teacher_update } from "./services";
import z from "zod";
import { TeacherUpdateData, TeacherUpdateDataSchema } from "./types";

export const teacherController: CreateServerOptions['beforeRoute'] = (app) => {
    app.get('/api/teachers/lookup', HttpCallAuthentication().middleware(), HttpCallValidation(teachersQuerySchema).middleware('query'), async (req, res) => {
        // get teachers
        const { name, classIds, page, sortBy, order } = (getRequestQuery() || {}) as TeachersQuery;
        const list = await teacher_filter({ name, classIds: (classIds?.split(',') || []), page: parseInt(page || '1'), sortBy: sortBy as any, order }, true);
        res.json(list);
        res.status(200);
    });
    app.get('/api/teachers/', HttpCallAuthentication().middleware(), HttpCallValidation(teachersQuerySchema).middleware('query'), async (req, res) => {
        // get teachers
        const { name, classIds, page, sortBy, order } = (getRequestQuery() || {}) as TeachersQuery;
        const list = await teacher_filter({ name, classIds: (classIds?.split(',') || []), page: parseInt(page || '1'), sortBy: sortBy as any, order });
        res.json(list);
        res.status(200);
    });
    app.get('/api/teachers/:id', HttpCallAuthentication().middleware(), HttpCallValidation(teachersParamsSchema).middleware('params'), async (req, res) => {
        // get teachers
        const { id } = (getRequestParams() || {}) as TeachersParams;
        const teacher = await teacher_by_id(id);
        res.json(teacher);
        res.status(200);
    });
    app.delete('/api/teachers/:id', HttpCallAuthentication().middleware(), HttpCallValidation(teachersParamsSchema).middleware('params'), async (req, res) => {
        // get teachers
        const { id } = (getRequestParams() || {}) as TeachersParams;
        await teacher_delete(id);
        res.status(200).end();
    });
    app.post('/api/teachers/add', HttpCallAuthentication().middleware(), HttpCallValidation(TeacherUpdateDataSchema).middleware('body'), async (req, res) => {
        const data = getRequestBody() as TeacherUpdateData;
        // add teacher
        const teacher = await teacher_add({ id: 's' + Date.now(), ...data });
        res.json(teacher);
        res.status(200);
    });
    app.post('/api/teachers/:id', HttpCallAuthentication().middleware(), HttpCallValidation(TeacherUpdateDataSchema).middleware('body'), HttpCallValidation(teachersParamsSchema).middleware('params'), async (req, res) => {
        const { id } = (getRequestParams() || {}) as TeachersParams;
        const data = getRequestBody() as TeacherUpdateData;
        // update teacher
        const record = await teacher_by_id(id);

        if (!record) {
            return res.status(404).json({
                code: 404,
                message: 'Not found'
            });
        }

        const teacher = await teacher_update({ id, ...data });
        res.json(teacher);
        res.status(200);
    });
}

const teachersQuerySchema = z.object({
    name: z.string().optional(),
    classIds: z.string().optional(),
    page: z.string().optional(),
    sortBy: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
});
type TeachersQuery = z.infer<typeof teachersQuerySchema>;
const teachersParamsSchema = z.object({
    id: z.string()
});
type TeachersParams = z.infer<typeof teachersParamsSchema>;