import { UploadFileType, UploadOptions } from "@/src/types/shared/upload";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectUploadData, setUploadFileType } from "@/src/reduxStore/states/upload";
import Upload from "../../shared/upload/Upload";
import { CacheEnum, selectCachedValue } from "@/src/reduxStore/states/cachedValues";
import { setAllProjects } from "@/src/reduxStore/states/project";
import { useLazyQuery } from "@apollo/client";
import { GET_PROJECT_LIST } from "@/src/services/gql/queries/projects";

const UPLOAD_OPTION = { deleteProjectOnFail: true, tokenizerValues: [] };
const COMPONENT_FILE_TYPE = UploadFileType.RECORDS_NEW;
export default function NewProject() {
    const dispatch = useDispatch();
    const currentFileType = useSelector(selectUploadData).uploadFileType;
    const tokenizerValues = useSelector(selectCachedValue(CacheEnum.TOKENIZER_VALUES));

    const [uploadOptions, setUploadOptions] = useState<UploadOptions>(UPLOAD_OPTION);

    const [refetchProjects] = useLazyQuery(GET_PROJECT_LIST, { fetchPolicy: "no-cache" });

    useEffect(() => {
        dispatch(setUploadFileType(COMPONENT_FILE_TYPE));
        refetchProjects().then((res) => {
            const projects = res.data["allProjects"].edges.map((edge: any) => edge.node);
            dispatch(setAllProjects(projects));
        });
    }, []);

    useEffect(() => {
        if (!currentFileType || currentFileType == COMPONENT_FILE_TYPE) return;
        dispatch(setUploadFileType(COMPONENT_FILE_TYPE));
    }, [currentFileType]);

    useEffect(() => {
        setUploadOptions({ ...UPLOAD_OPTION, tokenizerValues });
    }, [tokenizerValues]);

    return (
        <Upload uploadOptions={uploadOptions} />
    )
}
