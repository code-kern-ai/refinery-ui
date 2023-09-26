import { UploadFieldProps, UploadStates } from "@/src/types/shared/upload";
import { formatBytes } from "@/submodules/javascript-functions/general";
import { useEffect, useRef, useState } from "react";
import LoadingIcon from "../../loading/LoadingIcon";
import { UploadHelper } from "../Upload";
import { IconDatabase } from "@tabler/icons-react";

export default function UploadField(props: UploadFieldProps) {
    const fileUpload = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState(null);
    const [fileSize, setFileSize] = useState(null);

    // TODO: add this when the crypted field is added
    // const fileEndsWithZip: boolean = file ? file.name.endsWith(".zip") : false;

    useEffect(() => {
        if (props.isFileCleared) {
            setFile(null);
        }
    }, [props.isFileCleared]);

    function onFileInput(e: Event) {
        e.stopPropagation();
        if (fileUpload.current?.files && fileUpload.current?.files[0]) {
            setFileSize(formatBytes(fileUpload.current?.files[0].size));
            setFile(fileUpload.current?.files[0]);
            props.sendSelectedFile(fileUpload.current?.files[0]);
        } else {
            setFile(null);
        }
        fileUpload.current!.value = "";
    }

    function onFileRemove(event: Event): void {
        event.stopPropagation();
        setFile(null);
        fileUpload.current!.value = "";
    }

    return (
        <div>
            <input type="file" className="hidden" ref={fileUpload} onChange={(e: any) => onFileInput(e)} />
            <div className="flex flex-col">
                <div className="flex items-center justify-between">
                    <div className="flex flex-grow items-center overflow-x-hidden">
                        <div onClick={() => fileUpload.current?.click()}
                            className={`w-full border-4 border-dashed rounded-lg h-36 my-6 cursor-pointer ${file || props.uploadStarted ? 'bg-white' : 'border-slate-400'}`} style={{ 'pointerEvents': props.uploadStarted ? 'none' : 'auto' }}>
                            <IconDatabase className="h-9 w-8 m-auto block text-gray-500 mt-6" />
                            {file == null && !props.uploadStarted ? (<div className="text-gray-600 text-sm font-medium text-center mb-6">
                                <button className="text-indigo-700 mt-1">Click to select a file</button>
                                <div className="text-xs font-normal text-gray-500 mt-1">or drag and drop</div>
                            </div>) : (<>
                                <div className="text-indigo-700 text-center text-sm font-medium">{file?.name} <span
                                    className={`uppercase text-gray-600 ${props.doingSomething ? 'hidden' : 'inline-block'}`}>{fileSize}</span>
                                </div>
                                <button onClick={(e: any) => onFileRemove(e)}
                                    className={`bg-red-100 text-red-700 border border-red-400 text-xs font-semibold px-4 py-2 rounded-md cursor-pointer m-auto block hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${(props.uploadStarted || props.doingSomething) ? 'hidden' : 'block'}`}>
                                    Remove
                                </button></>)}

                            {props.uploadStarted && props.isFileCleared && (UploadHelper.getUploadTask()?.state == UploadStates.IN_PROGRESS || UploadHelper.getUploadTask()?.state == UploadStates.WAITING || UploadHelper.getUploadTask()?.state == UploadStates.PENDING) && <div>
                                <div className="flex flex-row items-center flex-nowrap -mt-1 mx-2 mb-2">
                                    <span className="whitespace-nowrap">Preparing data...</span>
                                    <LoadingIcon size="btn-xs" color="blue" />

                                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                        <div className="bg-blue-700 h-2.5 rounded-full" style={{ 'width': UploadHelper.getUploadTask().progress + '%' }}>
                                        </div>
                                    </div>
                                </div>
                            </div>}

                            {!props.isFileCleared && props.progressState && <div className="m-2">
                                {!(props.progressState.state === UploadStates.ERROR) && <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                    <div className="bg-green-400 h-2.5 rounded-full" style={{ 'width': props.progressState.progress + '%' }}>
                                    </div>
                                </div>}
                                {props.progressState.state === UploadStates.ERROR && <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                    <div className="bg-red-700 h-2.5 rounded-full" style={{ 'width': props.progressState.progress + '%' }}>
                                    </div>
                                </div>}
                            </div>}
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}
