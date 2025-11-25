export const FileFilter = (req: Express.Request, file: Express.Multer.File, callback: Function) => {

    if (!file) return callback(new Error('File is required'), false);

    const fileExtension = file.mimetype.split('/')[1];
    const validExtensions = ['xls', 'xlsx', 'csv'];

    if (validExtensions.includes(fileExtension)) {
        return callback(null, true);
    }

    callback(new Error('Invalid file extension'), false);
}