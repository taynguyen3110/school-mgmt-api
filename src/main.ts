import calls from './calls';
import { createServer } from '@jasonai/api';
import { config } from 'dotenv';
import { user_by_id } from './services';
import { authController } from './auth';
import { studentController } from './students';
import { parentController } from './parents';
import { teacherController } from './teachers';
import { subjectController } from './subjects';
import { classController } from './classes';
import { mediaController } from './media';
import express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import cors from 'cors';
import { statsController } from './stats';

config();

const server = createServer({
    calls, beforeRoute: (app) => {
        // Add CORS middleware
        app.use(cors({
            origin: ['http://localhost:4200', 'https://school-management-puce-five.vercel.app/'],
            credentials: true
        }));

        app.use((req, res, next) => {
            res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
            res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
            next();
        });

        // set static folder for photos
        app.use('/photos', express.static(path.join(__dirname, '../public/photos')));
        authController!(app);
        studentController!(app);
        parentController!(app);
        teacherController!(app);
        subjectController!(app);
        classController!(app);
        mediaController!(app);
        statsController!(app);
    },
    callsEndpoint: '/api',
    auth: {
        jwtExpirationMinutes: 60 * 24 * 30,
        jwtSecret: 'random_sfsfe_3243',
        jwtRefreshTokenExpirationMinutes: 60 * 24 * 30,
        roleRights: new Map(),
        getUser: async (id) => {
            const user = await user_by_id(id);
            return user || undefined;
        }
    }
});
server.start(3001);