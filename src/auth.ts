import { CreateServerOptions, getAuthStatus, getRequestBody, HttpCallAuthentication, HttpCallValidation } from "@jasonai/api";
import { generateAuthTokens } from "@jasonai/api/lib/server/utils/auth";
import z from "zod";
import { user_by_id, user_login, user_update } from "./services";
import { UserUpdateData, UserUpdateDataSchema } from "./types";

export const authController: CreateServerOptions['beforeRoute'] = (app) => {
    app.get('/', (req, res) => {
        res.send('School Management API');
        res.status(200);
    });
    // login
    app.post('/api/login', HttpCallValidation(z.object({ username: z.string(), password: z.string() })).middleware('body'),
        (req, res) => {
            const data: any = getRequestBody();
            const user = user_login(data.username, data.password);

            if (!user) {
                res.status(401);
                res.json({ code: 401, message: 'Invalid credentials' });
                return;
            } else {
                const auth = generateAuthTokens({ id: user.id, role: user.role });
                res.json(auth);
                res.status(200);
            }
        });

    // account
    app.get('/api/account', HttpCallAuthentication().middleware(), (req, res) => {
        const auth = getAuthStatus();
        const data = { ...auth.user, password: undefined };
        res.json(data);
    });
    app.post('/api/account', HttpCallAuthentication().middleware(), HttpCallValidation(UserUpdateDataSchema).middleware('body'), (req, res) => {
        const auth = getAuthStatus();
        const data = getRequestBody() as UserUpdateData;
        const record = user_by_id(auth.user?.id || '');

        if (!record) {
            return res.status(404).json({
                code: 404,
                message: 'Not found'
            });
        }

        const user = user_update({ id: auth.user?.id || '', ...data });

        res.json(data);
    });
    app.post('/api/account/change-password', HttpCallAuthentication().middleware(), HttpCallValidation(UserUpdateDataSchema).middleware('body'), (req, res) => {
        const auth = getAuthStatus();
        const data = getRequestBody() as UserUpdateData;
        const record = user_by_id(auth.user?.id || '');

        if (!record) {
            return res.status(404).json({
                code: 404,
                message: 'Not found'
            });
        }

        const user = user_update({ id: auth.user?.id || '', ...data });

        res.json(data);
    });
}