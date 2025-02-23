import { Inject, Injectable } from "@nestjs/common";
import * as Minio from 'minio'
import { MinioClient } from "./constants";

@Injectable()
export class FilesService {
    constructor(@Inject(MinioClient) private readonly minioClient: Minio.Client) {}
}