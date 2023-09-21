import { UploadState, UploadStates } from "@/src/types/shared/upload";
import { Observable } from '@apollo/client';
import { S3 } from 'aws-sdk';
import { ConfigManager } from "./config";


export function uploadFile(credentialsAndUploadIdParsed: any, file: File, filename: string): Observable<UploadState> {

    const credentials = credentialsAndUploadIdParsed["Credentials"];
    const uploadTaskId = credentialsAndUploadIdParsed["uploadTaskId"];
    const bucket = credentialsAndUploadIdParsed["bucket"];
    const s3Endpoint = ConfigManager.getConfigValue("KERN_S3_ENDPOINT");
    const s3Region = ConfigManager.getConfigValue('s3_region');

    const s3Client = new S3({
        endpoint: s3Endpoint,
        accessKeyId: credentials["AccessKeyId"],
        secretAccessKey: credentials["SecretAccessKey"],
        sessionToken: credentials["SessionToken"],
        region: s3Region,
        s3BucketEndpoint: false,
        s3ForcePathStyle: true,
        signatureVersion: 'v4',
        sslEnabled: false,
    });

    const key = uploadTaskId + "/" + filename;

    return new Observable((subscriber) => {
        var managedUpload = s3Client.upload({
            Bucket: bucket,
            Key: key,
            Body: file,
        }, {}, function (err, data) {
            if (err) {
                subscriber.error({
                    state: UploadStates.ERROR,
                    progress: 100
                })
            }
            subscriber.next({
                state: UploadStates.DONE,
                progress: 100
            })
            subscriber.complete();
        });
        return managedUpload.on('httpUploadProgress', function (progress) {
            subscriber.next({
                state: UploadStates.IN_PROGRESS,
                progress: Math.round(progress.loaded / progress.total * 100)
            })
        });
    })
}
