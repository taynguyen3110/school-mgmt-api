import { CreateServerOptions, getRequestBody, getRequestParams, getRequestQuery, HttpCallAuthentication, HttpCallValidation } from "@jasonai/api";
import { class_add, class_by_id, class_delete, class_filter, class_update } from "./services";
import z from "zod";
import { ClassUpdateData, ClassUpdateDataSchema } from "./types";

export const classController: CreateServerOptions['beforeRoute'] = (app) => {
    app.get('/api/classes/lookup', HttpCallAuthentication().middleware(), HttpCallValidation(classsQuerySchema).middleware('query'), async (req, res) => {
        // get classs
        const { name, page, sortBy, order } = (getRequestQuery() || {}) as ClasssQuery;
        const list = await class_filter({ name, page: parseInt(page || '1'), sortBy: sortBy as any, order }, true);
        res.json(list);
        res.status(200);
    });
    app.get('/api/classes/', HttpCallAuthentication().middleware(), HttpCallValidation(classsQuerySchema).middleware('query'), async (req, res) => {
        // get classs
        const { name, page, sortBy, order } = (getRequestQuery() || {}) as ClasssQuery;
        const list = await class_filter({ name, page: parseInt(page || '1'), sortBy: sortBy as any, order });
        res.json(list);
        res.status(200);
    });
    app.get('/api/classes/:id', HttpCallAuthentication().middleware(), HttpCallValidation(classsParamsSchema).middleware('params'), async (req, res) => {
        // get classs
        const { id } = (getRequestParams() || {}) as ClasssParams;
        const classData = await class_by_id(id);
        res.json(classData);
        res.status(200);
    });
    app.delete('/api/classes/:id', HttpCallAuthentication().middleware(), HttpCallValidation(classsParamsSchema).middleware('params'), async (req, res) => {
        // get classs
        const { id } = (getRequestParams() || {}) as ClasssParams;
        await class_delete(id);
        res.status(200).end();
    });
    app.post('/api/classes/add', HttpCallAuthentication().middleware(), HttpCallValidation(ClassUpdateDataSchema).middleware('body'), async (req, res) => {
        const data = getRequestBody() as ClassUpdateData;
        // add class
        const classData = await class_add({ id: 's' + Date.now(), ...data });
        res.json(classData);
        res.status(200);
    });
    app.post('/api/classes/:id', HttpCallAuthentication().middleware(), HttpCallValidation(ClassUpdateDataSchema).middleware('body'), HttpCallValidation(classsParamsSchema).middleware('params'), async (req, res) => {
        const { id } = (getRequestParams() || {}) as ClasssParams;
        const data = getRequestBody() as ClassUpdateData;
        // update class
        const record = await class_by_id(id);
        if (!record) {
            return res.status(404).json({
                code: 404,
                message: 'Not found'
            });
        }
        const classData = await class_update({ id, ...data });
        res.json(classData);
        res.status(200);
    });
}

const classsQuerySchema = z.object({
    name: z.string().optional(),
    page: z.string().optional(),
    sortBy: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
});
type ClasssQuery = z.infer<typeof classsQuerySchema>;
const classsParamsSchema = z.object({
    id: z.string()
});
type ClasssParams = z.infer<typeof classsParamsSchema>;