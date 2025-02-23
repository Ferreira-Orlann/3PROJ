import { Inject, Injectable } from "@nestjs/common";
import * as Minio from 'minio'
import { MinioClient } from "./constants";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class FilesService {
    private readonly bukketName
    constructor(@Inject(MinioClient) private readonly minioClient: Minio.Client, private readonly configService: ConfigService) {
        this.bukketName = configService.get<string>("S3_BUCKET")
        minioClient.bucketExists(this.bukketName).then(async (exist) => {
            if (!exist) {
                minioClient.makeBucket(this.bukketName, "eu-west-3")
            }
        })
    }
}