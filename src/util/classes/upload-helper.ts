import { UploadTask } from "@/src/types/shared/upload";

export class UploadHelper {
    private static projectId: string | null = null;
    private static uploadTask: UploadTask | null = null;
    public static setProjectId(projectId: string) {
        UploadHelper.projectId = projectId;
    }

    public static getProjectId() {
        return UploadHelper.projectId;
    }

    public static setUploadTask(uploadTask: UploadTask) {
        UploadHelper.uploadTask = uploadTask;
    }

    public static getUploadTask() {
        return UploadHelper.uploadTask;
    }
}