import { Controller, Get, Param, Post, StreamableFile, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { FilesService } from "./files.service";
import { randomUUID, UUID } from "crypto";

@Controller("files")
export class FilesController {
    constructor(private readonly filesService: FilesService) {}

    @Post("upload")
    @UseInterceptors(FileInterceptor('file'))
    upload(@UploadedFile() file: Express.Multer.File) {
        this.filesService.getMinioClient().putObject(this.filesService.getBucketName(), randomUUID(), file.buffer, file.size)
    }

    @Get(":fileUuid")
    async download(@Param("fileUuid") fileUuid: UUID) {
        return new StreamableFile(await this.filesService.getMinioClient().getObject(this.filesService.getBucketName(), fileUuid));
    }
}