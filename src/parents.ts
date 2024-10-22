import { CreateServerOptions, getRequestBody, getRequestParams, getRequestQuery, HttpCallAuthentication, HttpCallValidation } from "@jasonai/api";
import { parent_add, parent_by_id, parent_delete, parent_filter, parent_update, student_add, student_by_id, student_filter, student_update } from "./services";
import z from "zod";
import { ParentUpdateData, Parent, ParentUpdateDataSchema } from "./types";

export const parentController: CreateServerOptions['beforeRoute'] = (app) => {
    app.get('/api/parents/lookup', HttpCallAuthentication().middleware(), HttpCallValidation(parentsQuerySchema).middleware('query'), (req, res) => {
        // get parents
        const { name, classIds, page, sortBy, order } = (getRequestQuery() || {}) as ParentsQuery;
        const list = parent_filter({ name, classIds: (classIds?.split(',') || []), page: parseInt(page || '1'), sortBy: sortBy as any, order }, true);
        res.json(list);
        res.status(200);
    });
    app.get('/api/parents/', HttpCallAuthentication().middleware(), HttpCallValidation(parentsQuerySchema).middleware('query'), (req, res) => {
        // get parents
        const { name, classIds, page, sortBy, order } = (getRequestQuery() || {}) as ParentsQuery;
        const list = parent_filter({ name, classIds: (classIds?.split(',') || []), page: parseInt(page || '1'), sortBy: sortBy as any, order });
        res.json(list);
        res.status(200);
    });
    app.get('/api/parents/:id', HttpCallAuthentication().middleware(), HttpCallValidation(parentsParamsSchema).middleware('params'), (req, res) => {
        // get parents
        const { id } = (getRequestParams() || {}) as ParentsParams;
        const parent = parent_by_id(id);
        res.json(parent);
        res.status(200);
    });
    app.delete('/api/parents/:id', HttpCallAuthentication().middleware(), HttpCallValidation(parentsParamsSchema).middleware('params'), (req, res) => {
        // get parents
        const { id } = (getRequestParams() || {}) as ParentsParams;
        parent_delete(id);
        res.status(200).end();
    });
    app.post('/api/parents/add', HttpCallAuthentication().middleware(), HttpCallValidation(ParentUpdateDataSchema).middleware('body'), (req, res) => {
        const data = getRequestBody() as ParentUpdateData;
        // add parent
        const parent = parent_add({ id: 's' + Date.now(), ...data });
        res.json(parent);
        res.status(200);
    });
    app.post('/api/parents/:id', HttpCallAuthentication().middleware(), HttpCallValidation(ParentUpdateDataSchema).middleware('body'), HttpCallValidation(parentsParamsSchema).middleware('params'), (req, res) => {
        const { id } = (getRequestParams() || {}) as ParentsParams;
        const data = getRequestBody() as ParentUpdateData;
        // update parent
        const record = parent_by_id(id);
        if (!record) {
            return res.status(404).json({
                code: 404,
                message: 'Not found'
            });
        }
        const parent = parent_update({ id, ...data });
        res.json(parent);
        res.status(200);
    });
}

const parentsQuerySchema = z.object({
    name: z.string().optional(),
    classIds: z.string().optional(),
    page: z.string().optional(),
    sortBy: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
});
type ParentsQuery = z.infer<typeof parentsQuerySchema>;
const parentsParamsSchema = z.object({
    id: z.string()
});
type ParentsParams = z.infer<typeof parentsParamsSchema>;