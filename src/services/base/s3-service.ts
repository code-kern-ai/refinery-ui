import { UploadState, UploadStates } from "@/src/types/shared/upload";
import { ConfigManager } from "./config";
import { Observable } from "rxjs";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";


export function uploadFile(credentialsAndUploadIdParsed: any, file: File, filename: string): Observable<UploadState> {
    const credentials = credentialsAndUploadIdParsed["Credentials"];
    const uploadTaskId = credentialsAndUploadIdParsed["uploadTaskId"];
    const bucket = credentialsAndUploadIdParsed["bucket"];
    const s3Endpoint = ConfigManager.getConfigValue("KERN_S3_ENDPOINT");
    const s3Region = ConfigManager.getConfigValue('s3_region');

    const s3Client = new S3Client({
        endpoint: s3Endpoint,
        forcePathStyle: true,
        region: s3Region,
        credentials: {
            accessKeyId: credentials["AccessKeyId"],
            secretAccessKey: credentials["SecretAccessKey"],
            sessionToken: credentials["SessionToken"],
        },
    });

    const key = uploadTaskId + "/" + filename;

    return new Observable((subscriber) => {
        s3Client.send(new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: file,
        })).then(data => {
            subscriber.next({
                state: UploadStates.DONE,
                progress: 100
            });
        }).catch(err => {
            subscriber.error({
                state: UploadStates.ERROR,
                progress: 100
            });
        });
    })
}

export function downloadFile(credentialBlock: any, isStringData: boolean = true): any {
    const credentials = credentialBlock["Credentials"];
    const object = credentialBlock["objectName"];
    const bucket = credentialBlock["bucket"];
    const s3Endpoint = ConfigManager.getConfigValue("KERN_S3_ENDPOINT");
    const s3Region = ConfigManager.getConfigValue('s3_region');

    const s3Client = new S3Client({
        endpoint: s3Endpoint,
        forcePathStyle: true,
        region: s3Region,
        credentials: {
            accessKeyId: credentials["AccessKeyId"],
            secretAccessKey: credentials["SecretAccessKey"],
            sessionToken: credentials["SessionToken"],
        },
    });

    var getParams = {
        Bucket: bucket,
        Key: object
    }
    return new Observable((subscriber) => {
        s3Client.send(new GetObjectCommand(getParams)).then(data => {
            const bodyContents = data.Body;

            if (isStringData && bodyContents instanceof ReadableStream) {
                const reader = bodyContents.getReader();
                reader.read().then(({ done, value }) => {
                    const objectData = new TextDecoder('utf-8').decode(value);
                    subscriber.next(objectData);
                });
            } else {
                //new sdk can return readableStream or blob 
                if (bodyContents instanceof ReadableStream) {
                    bodyContents.transformToByteArray().then((data: any) => {
                        subscriber.next(new Blob([data]));
                    })
                }
                else {
                    subscriber.next(bodyContents);
                }
            }
        }).catch(err => {
            subscriber.error(null);
        });
    });

}