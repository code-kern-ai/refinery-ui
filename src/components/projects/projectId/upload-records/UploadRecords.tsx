import Upload from "@/src/components/shared/upload/Upload";
import { selectUploadData, setUploadFileType } from "@/src/reduxStore/states/upload";
import { UploadFileType, UploadOptions } from "@/src/types/shared/upload";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const BASE_OPTIONS = { deleteProjectOnFail: false };
const COMPONENT_FILE_TYPE = UploadFileType.RECORDS_ADD;

export default function UploadRecords() {
    const dispatch = useDispatch();

    const currentFileType = useSelector(selectUploadData).uploadFileType;
    const [uploadOptions, setUploadOptions] = useState<UploadOptions>(BASE_OPTIONS);

    useEffect(() => {
        dispatch(setUploadFileType(COMPONENT_FILE_TYPE));
        setUploadOptions({ ...BASE_OPTIONS });
    }, []);

    useEffect(() => {
        if (!currentFileType || currentFileType == COMPONENT_FILE_TYPE) return;
        dispatch(setUploadFileType(COMPONENT_FILE_TYPE));
    }, [currentFileType]);

    return (<div className="h-full bg-gray-100 flex overflow-hidden">
        <div className="h-full w-full flex-1 flex flex-col overflow-auto">
            <Upload uploadOptions={uploadOptions}></Upload>
        </div>
    </div>);
}