import { BadRequestException, Injectable, Logger } from '@nestjs/common';


@Injectable()
export class FilesService {
  
  private readonly logger = new Logger('FilesService');

  async uploadFile(file: Express.Multer.File) {

    try {

      if (!file) throw new BadRequestException('File must be a Excel file');
      
      return { message: 'File uploaded successfully' };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }
}
