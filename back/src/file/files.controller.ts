import { Controller, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller("files/:fileUuid")
export class FilesController {
    @UseInterceptors(FileInterceptor('file'))
    upload(@UploadedFile() file: Express.Multer.File) {
        
    }
}