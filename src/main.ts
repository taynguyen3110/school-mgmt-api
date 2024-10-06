import calls from './calls';
import { createServer } from '@jasonai/api';
import { config } from 'dotenv';
import { user_by_id } from './services';
import { authController } from './auth';
import { studentController } from './students';
import { parentController } from './parents';
import { teacherController } from './teachers';
import { subjectController } from './subjects';

config();

const server = createServer({
    calls, beforeRoute: (app) => {
        authController!(app);
        studentController!(app);
        parentController!(app);
        teacherController!(app);
        subjectController!(app);
    },
    callsEndpoint: '/api',
    auth: {
        jwtExpirationMinutes: 60,
        jwtSecret: 'random_sfsfe_3243',
        jwtRefreshTokenExpirationMinutes: 60 * 24 * 30,
        roleRights: new Map(),
        getUser: async (id) => {
            return user_by_id(id);
        }
    }
});
server.start(3001);