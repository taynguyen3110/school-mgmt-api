import { CreateServerOptions, getRequestBody, getRequestParams, getRequestQuery, HttpCallAuthentication, HttpCallValidation } from "@jasonai/api";
import { subject_add, subject_by_id, subject_delete, subject_filter, subject_update } from "./services";
import z from "zod";
import { SubjectUpdateData, SubjectUpdateDataSchema } from "./types";

export const subjectController: CreateServerOptions['beforeRoute'] = (app) => {
    app.get('/api/subjects/lookup', HttpCallAuthentication().middleware(), HttpCallValidation(subjectsQuerySchema).middleware('query'), async (req, res) => {
        // get subjects
        const { name, classIds, page, sortBy, order } = (getRequestQuery() || {}) as SubjectsQuery;
        const list = await subject_filter({ name, classIds: (classIds?.split(',') || []), page: parseInt(page || '1'), sortBy: sortBy as any, order }, true);
        res.json(list);
        res.status(200);
    });
    app.get('/api/subjects/', HttpCallAuthentication().middleware(), HttpCallValidation(subjectsQuerySchema).middleware('query'), async (req, res) => {
        // get subjects
        const { name, classIds, schedule, page, sortBy, order } = (getRequestQuery() || {}) as SubjectsQuery;
        const list = await subject_filter({ name, classIds: (classIds?.split(',') || []), schedule, page: parseInt(page || '1'), sortBy: sortBy as any, order });
        res.json(list);
        res.status(200);
    });
    app.get('/api/subjects/:id', HttpCallAuthentication().middleware(), HttpCallValidation(subjectsParamsSchema).middleware('params'), async (req, res) => {
        // get subjects
        const { id } = (getRequestParams() || {}) as SubjectsParams;
        const subject = await subject_by_id(id);
        res.json(subject);
        res.status(200);
    });
    app.delete('/api/subjects/:id', HttpCallAuthentication().middleware(), HttpCallValidation(subjectsParamsSchema).middleware('params'), async (req, res) => {
        // get subjects
        const { id } = (getRequestParams() || {}) as SubjectsParams;
        await subject_delete(id);
        res.status(200).end();
    });
    app.post('/api/subjects/add', HttpCallAuthentication().middleware(), HttpCallValidation(SubjectUpdateDataSchema).middleware('body'), async (req, res) => {
        const data = getRequestBody() as SubjectUpdateData;
        // add subject
        const subject = await subject_add({ id: 's' + Date.now(), ...data });
        res.json(subject);
        res.status(200);
    });
    app.post('/api/subjects/:id', HttpCallAuthentication().middleware(), HttpCallValidation(SubjectUpdateDataSchema).middleware('body'), HttpCallValidation(subjectsParamsSchema).middleware('params'), async (req, res) => {
        const { id } = (getRequestParams() || {}) as SubjectsParams;
        const data = getRequestBody() as SubjectUpdateData;
        // update subject
        const record = await subject_by_id(id);

        if (!record) {
            return res.status(404).json({
                code: 404,
                message: 'Not found'
            });
        }

        const subject = await subject_update({ id, ...data });
        res.json(subject);
        res.status(200);
    });
}

const subjectsQuerySchema = z.object({
    name: z.string().optional(),
    classIds: z.string().optional(),
    schedule: z.string().optional(),
    page: z.string().optional(),
    sortBy: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
});
type SubjectsQuery = z.infer<typeof subjectsQuerySchema>;
const subjectsParamsSchema = z.object({
    id: z.string()
});
type SubjectsParams = z.infer<typeof subjectsParamsSchema>;