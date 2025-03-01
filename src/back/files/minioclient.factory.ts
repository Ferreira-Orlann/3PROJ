import * as Minio from "minio";
import { ConfigService } from "@nestjs/config";

export function MinioClientFactory(configService: ConfigService) {
    const minioClient = new Minio.Client({
        endPoint: configService.get<string>("S3_HOST"),
        port: configService.get<number>("S3_PORT"),
        useSSL: "true" == configService.get<string>("S3_USE_SSL"),
        accessKey: configService.get<string>("S3_ACCESS_KEY"),
        secretKey: configService.get<string>("S3_SECRET_KEY"),
    });
    return minioClient;
}
