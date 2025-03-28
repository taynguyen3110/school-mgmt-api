import { CreateServerOptions, HttpCallAuthentication } from "@jasonai/api";
import { db_stats } from './services';

export const statsController: CreateServerOptions['beforeRoute'] = (app) => {
    app.get('/api/statistics', HttpCallAuthentication().middleware(), async (req, res) => {
        const stats = await db_stats();
        res.json(stats);
        res.status(200);
    });
}