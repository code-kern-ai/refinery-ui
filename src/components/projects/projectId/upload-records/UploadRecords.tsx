import Upload from "@/src/components/shared/upload/Upload";
import { setUploadFileType } from "@/src/reduxStore/states/upload";
import { UploadFileType, UploadOptions } from "@/src/types/shared/upload";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

const BASE_OPTIONS = { deleteProjectOnFail: false };

export default function UploadRecords() {
    const dispatch = useDispatch();

    const [uploadOptions, setUploadOptions] = useState<UploadOptions>(BASE_OPTIONS);

    useEffect(() => {
        dispatch(setUploadFileType(UploadFileType.RECORDS_ADD));
        setUploadOptions({ ...BASE_OPTIONS });
    }, []);

    return (<div className="h-full bg-gray-100 flex overflow-hidden">
        <div className="h-full w-full flex-1 flex flex-col overflow-auto">
            <Upload uploadOptions={uploadOptions}></Upload>
        </div>
    </div>);
}