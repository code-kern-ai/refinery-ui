import { useRef, useState } from "react";

export default function UploadField() {
    const fileUpload = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [uploadStarted, setUploadStarted] = useState<boolean>(false);
    const [doingSomething, setDoingSomething] = useState<boolean>(false);

    const fileEndsWithZip: boolean = file ? file.name.endsWith(".zip") : false;
    const disableInput: boolean = false

    function onFileInput(e: Event) {
        e.stopPropagation();
        setFile(fileUpload.current?.files ? fileUpload.current?.files[0] : null);
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
                                    className={`uppercase text-gray-600 ${doingSomething ? 'hidden' : 'inline-block'}`}>{file?.size}</span>
                                </div>
                                <button onClick={(e: any) => onFileRemove(e)}
                                    className={`bg-red-100 text-red-700 border border-red-400 text-xs font-semibold px-4 py-2 rounded-md cursor-pointer m-auto block hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${(uploadStarted && disableInput) || doingSomething ? 'hidden' : 'block'}`}>
                                    Remove
                                </button></>)}
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}
