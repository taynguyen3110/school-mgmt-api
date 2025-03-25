import { CreateServerOptions, getAuthStatus, getRequestBody, HttpCallAuthentication, HttpCallValidation } from "@jasonai/api";
import { generateAuthTokens } from "@jasonai/api/lib/server/utils/auth";
import z from "zod";
import { user_by_id, user_login, user_update } from "./services";
import { User, UserUpdateData, UserUpdateDataSchema, UserUpdatePasswordData, UserUpdatePasswordSchema } from "./types";

export const authController: CreateServerOptions['beforeRoute'] = (app) => {
    app.get('/', (req, res) => {
        res.send('School Management API');
        res.status(200);
    });
    // login
    app.post('/api/login', HttpCallValidation(z.object({ username: z.string(), password: z.string() })).middleware('body'),
        async (req, res) => {
            const data: any = getRequestBody();
            const user = await user_login(data.username, data.password);

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
    app.post('/api/account', HttpCallAuthentication().middleware(), HttpCallValidation(UserUpdateDataSchema).middleware('body'), async (req, res) => {
        const auth = getAuthStatus();
        const data = getRequestBody() as UserUpdateData;
        const record = await user_by_id(auth.user?.id || '') as User;

        if (!record) {
            return res.status(404).json({
                code: 404,
                message: 'Not found'
            });
        }

        await user_update({ ...record, ...data });
        res.json(data);
    });
    app.post('/api/account/change-password', HttpCallAuthentication().middleware(), HttpCallValidation(UserUpdatePasswordSchema).middleware('body'), async (req, res) => {
        const auth = getAuthStatus();
        const data = getRequestBody() as UserUpdatePasswordData;
        const record = await user_by_id(auth.user?.id || '') as User;

        if (!record) {
            return res.status(404).json({
                code: 404,
                message: 'Not found'
            });
        }

        await user_update({ ...record, password: data.password });
        res.json({ message: 'Password updated successfully' });
    });
}