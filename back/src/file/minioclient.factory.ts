import * as Minio from 'minio'
import { BucketName } from './constants'

export function MinioClientFactory() {
    const minioClient = new Minio.Client({
        endPoint: "localhost",
        port: 9000,
        useSSL: true,
        accessKey: "minioadmin",
        secretKey: "minioadmin",
    })
    minioClient.bucketExists(BucketName).then(async (exist) => {
        if (!exist) {
            minioClient.makeBucket(BucketName, "eu-west-3")
        }
    })
    return minioClient
} 