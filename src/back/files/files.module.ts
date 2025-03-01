import { Module } from "@nestjs/common";
import { MinioClient } from "./constants";
import { MinioClientFactory } from "./minioclient.factory";
import { FilesService } from "./files.service";
import { FilesController } from "./files.controller";
import { ConfigService } from "@nestjs/config";

@Module({
    providers: [
        {
            provide: MinioClient,
            useFactory: MinioClientFactory,
            inject: [ConfigService],
        },
        FilesService,
    ],
    controllers: [FilesController],
    exports: [FilesService],
})
export class FilesModule {}
