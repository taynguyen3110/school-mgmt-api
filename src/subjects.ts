import { CreateServerOptions, getRequestBody, getRequestParams, getRequestQuery, HttpCallAuthentication, HttpCallValidation } from "@jasonai/api";
import { subject_add, subject_by_id, subject_delete, subject_filter, subject_update } from "./services";
import z from "zod";
import { SubjectUpdateData, SubjectUpdateDataSchema } from "./types";

export const subjectController: CreateServerOptions['beforeRoute'] = (app) => {
    app.get('/api/subjects/lookup', HttpCallAuthentication().middleware(), HttpCallValidation(subjectsQuerySchema).middleware('query'), (req, res) => {
        // get subjects
        const { name, classIds, page, sortBy, order } = (getRequestQuery() || {}) as SubjectsQuery;
        const list = subject_filter({ name, classIds: (classIds?.split(',') || []), page: parseInt(page || '1'), sortBy: sortBy as any, order }, true);
        res.json(list);
        res.status(200);
    });
    app.get('/api/subjects/', HttpCallAuthentication().middleware(), HttpCallValidation(subjectsQuerySchema).middleware('query'), (req, res) => {
        // get subjects
        const { name, classIds, page, sortBy, order } = (getRequestQuery() || {}) as SubjectsQuery;
        const list = subject_filter({ name, classIds: (classIds?.split(',') || []), page: parseInt(page || '1'), sortBy: sortBy as any, order });
        res.json(list);
        res.status(200);
    });
    app.get('/api/subjects/:id', HttpCallAuthentication().middleware(), HttpCallValidation(subjectsParamsSchema).middleware('params'), (req, res) => {
        // get subjects
        const { id } = (getRequestParams() || {}) as SubjectsParams;
        const subject = subject_by_id(id);
        res.json(subject);
        res.status(200);
    });
    app.delete('/api/subjects/:id', HttpCallAuthentication().middleware(), HttpCallValidation(subjectsParamsSchema).middleware('params'), (req, res) => {
        // get subjects
        const { id } = (getRequestParams() || {}) as SubjectsParams;
        subject_delete(id);
        res.status(200).end();
    });
    app.post('/api/subjects/add', HttpCallAuthentication().middleware(), HttpCallValidation(SubjectUpdateDataSchema).middleware('body'), (req, res) => {
        const data = getRequestBody() as SubjectUpdateData;
        // add subject
        const subject = subject_add({ id: 's' + Date.now(), ...data });
        res.json(subject);
        res.status(200);
    });
    app.post('/api/subjects/:id', HttpCallAuthentication().middleware(), HttpCallValidation(SubjectUpdateDataSchema).middleware('body'), HttpCallValidation(subjectsParamsSchema).middleware('params'), (req, res) => {
        const { id } = (getRequestParams() || {}) as SubjectsParams;
        const data = getRequestBody() as SubjectUpdateData;
        // update subject
        const record = subject_by_id(id);

        if (!record) {
            return res.status(404).json({
                code: 404,
                message: 'Not found'
            });
        }

        const subject = subject_update({ id, ...data });
        res.json(subject);
        res.status(200);
    });
}

const subjectsQuerySchema = z.object({
    name: z.string().optional(),
    classIds: z.string().optional(),
    page: z.string().optional(),
    sortBy: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
});
type SubjectsQuery = z.infer<typeof subjectsQuerySchema>;
const subjectsParamsSchema = z.object({
    id: z.string()
});
type SubjectsParams = z.infer<typeof subjectsParamsSchema>;