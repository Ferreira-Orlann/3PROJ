import { Module } from "@nestjs/common";
import { MinioClient } from "./constants";
import { MinioClientFactory } from "./minioclient.factory";
import { FilesService } from "./files.service";
import { FilesController } from "./files.controller";

@Module({
    providers: [{
        provide: MinioClient,
        useFactory: MinioClientFactory
    }, FilesService],
    controllers: [FilesController],
    exports: [FilesService]
})
export class FileModule {}