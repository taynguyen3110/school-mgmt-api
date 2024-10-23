import { CreateServerOptions, getRequestBody, HttpCallAuthentication, HttpCallValidation } from "@jasonai/api";
import z from "zod";
import * as fs from 'fs';
import * as path from 'path';

export const mediaController: CreateServerOptions['beforeRoute'] = (app) => {

    app.post('/api/media/photo', HttpCallAuthentication().middleware(), HttpCallValidation(PhotoUploadSchema).middleware('body'), (req, res) => {
        const data = getRequestBody() as PhotoUpload;
        const fileName = 's' + Date.now();
        // save photo: can be jpg, png, etc.
        // photo saved to public/photos folder, use path
        const photoPath = path.join(__dirname, `../public/photos/${fileName}`);
        const extension = base64ToFile(data.base64, photoPath);

        // return photo path as public url
        res.json({ url: `${process.env.HOST}/photos/${fileName}.${extension}` });
        res.status(200);
    });
}
const PhotoUploadSchema = z.object({
    base64: z.string()
});

type PhotoUpload = z.infer<typeof PhotoUploadSchema>;

function base64ToFile(base64: string, filePathWithoutExtension: string) {
    // Extract file extension from base64 string (e.g., 'image/png')
    const match = base64.match(/^data:(image\/\w+);base64,/);
    if (!match) {
        throw new Error('Invalid base64 string');
    }

    // Get the file extension from the matched MIME type
    const mimeType = match[1];
    const extension = mimeType.split('/')[1];

    // Remove the base64 header (e.g., 'data:image/png;base64,')
    const base64Data = base64.replace(/^data:.+;base64,/, '');

    // Convert base64 string to a buffer
    const fileData = Buffer.from(base64Data, 'base64');

    // Construct the full file path with the correct extension
    const fullFilePath = `${filePathWithoutExtension}.${extension}`;

    // Write the buffer to a file
    fs.writeFileSync(fullFilePath, fileData);
    return extension;
}