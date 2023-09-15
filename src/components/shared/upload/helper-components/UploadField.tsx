import { UploadState, UploadStates, UploadTask } from "@/src/types/shared/upload";
import { formatBytes } from "@/submodules/javascript-functions/general";
import { useRef, useState } from "react";
import LoadingIcon from "../../loading/LoadingIcon";
import { useDispatch, useSelector } from "react-redux";
import { selectUploadData } from "@/src/reduxStore/states/upload";

export default function UploadField() {
    const dispatch = useDispatch();
    const fileUpload = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState(null);

    const [uploadStarted, setUploadStarted] = useState<boolean>(false);
    const [doingSomething, setDoingSomething] = useState<boolean>(false);
    const [uploadTask, setUploadTask] = useState<UploadTask>(null);
    const [progressState, setProgressState] = useState<UploadState>(null);

    // const fileEndsWithZip: boolean = file ? file.name.endsWith(".zip") : false;

    function onFileInput(e: Event) {
        e.stopPropagation();
        if (fileUpload.current?.files && fileUpload.current?.files[0]) {
            const fileCopy: any = [...fileUpload.current?.files][0];
            fileCopy.fizeSize = formatBytes(fileCopy.size);
            setFile(fileCopy);
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
                            className={`w-full border-4 border-dashed rounded-lg h-36 my-6 cursor-pointer ${file || uploadStarted ? 'bg-white' : 'border-slate-400'}`} style={{ 'pointerEvents': uploadStarted ? 'none' : 'auto' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-8 m-auto block text-gray-500 mt-6" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                            </svg>
                            {file == null && !uploadStarted ? (<div className="text-gray-600 text-sm font-medium text-center mb-6">
                                <button className="text-indigo-700 mt-1">Click to select a file</button>
                                <div className="text-xs font-normal text-gray-500 mt-1">or drag and drop</div>
                            </div>) : (<>
                                <div className="text-indigo-700 text-center text-sm font-medium">{file?.name} <span
                                    className={`uppercase text-gray-600 ${doingSomething ? 'hidden' : 'inline-block'}`}>{file.fizeSize}</span>
                                </div>
                                <button onClick={(e: any) => onFileRemove(e)}
                                    className={`bg-red-100 text-red-700 border border-red-400 text-xs font-semibold px-4 py-2 rounded-md cursor-pointer m-auto block hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${(uploadStarted || doingSomething) ? 'hidden' : 'block'}`}>
                                    Remove
                                </button></>)}

                            {uploadStarted && !file && (uploadTask?.state == UploadStates.IN_PROGRESS || uploadTask?.state == UploadStates.WAITING || uploadTask?.state == UploadStates.PENDING) && <div>
                                <div className="flex flex-row items-center flex-nowrap -mt-1 mx-2 mb-2">
                                    <span className="whitespace-nowrap">Preparing data...</span>
                                    <LoadingIcon size="btn-xs" color="blue" />

                                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                        <div className="bg-blue-700 h-2.5 rounded-full" style={{ 'width': uploadTask.progress + '%' }}>
                                        </div>
                                    </div>
                                </div>
                            </div>}

                            {file && progressState && <div className="m-2">
                                {!(progressState.state === UploadStates.ERROR) && <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                    <div className="bg-blue-700 h-2.5 rounded-full" style={{ 'width': progressState.progress + '%' }}>
                                    </div>
                                </div>}
                                {progressState.state === UploadStates.ERROR && <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                    <div className="bg-red-700 h-2.5 rounded-full" style={{ 'width': progressState.progress + '%' }}>
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
