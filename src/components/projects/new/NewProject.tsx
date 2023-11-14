import { UploadFileType, UploadOptions } from "@/src/types/shared/upload";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUploadFileType } from "@/src/reduxStore/states/upload";
import Upload from "../../shared/upload/Upload";
import { CacheEnum, selectCachedValue } from "@/src/reduxStore/states/cachedValues";

const UPLOAD_OPTION = { deleteProjectOnFail: true, tokenizerValues: [] };

export default function NewProject() {
    const dispatch = useDispatch();

    const tokenizerValues = useSelector(selectCachedValue(CacheEnum.TOKENIZER_VALUES));

    const [uploadOptions, setUploadOptions] = useState<UploadOptions>(UPLOAD_OPTION);

    useEffect(() => {
        dispatch(setUploadFileType(UploadFileType.RECORDS_NEW));
    }, []);

    useEffect(() => {
        setUploadOptions({ ...UPLOAD_OPTION, tokenizerValues });
    }, [tokenizerValues]);

    return (
        <Upload uploadOptions={uploadOptions} />
    )
}
