import { UploadFileType, UploadStates, UploadWrapperProps } from "@/src/types/shared/upload";
import UploadField from "./UploadField";
import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectUploadData, setImportOptions } from "@/src/reduxStore/states/upload";
import { useRouter } from "next/router";

export default function UploadWrapper(props: UploadWrapperProps) {
    const router = useRouter();
    const dispatch = useDispatch();

    const uploadFileType = useSelector(selectUploadData).uploadFileType;
    const importOptions = useSelector(selectUploadData).importOptions;

    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const textareaRef = useRef<HTMLTextAreaElement>(null);


    return (<>
        <UploadField isFileCleared={props.isFileCleared} uploadStarted={props.uploadStarted} doingSomething={props.doingSomething} progressState={props.progressState} sendSelectedFile={(file) => {
            setSelectedFile(file);
            props.sendSelectedFile(file)
        }} />
        {props.submitted && !selectedFile && props.uploadTask?.state !== UploadStates.IN_PROGRESS && <div className="rounded-md bg-yellow-50 p-4">
            <div className="flex">
                <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                        fill="currentColor">
                        <path fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd" />
                    </svg>
                </div>
                <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">File required</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                        <p>If you are choosing to start a project by uploading a file, you must specify one
                            first. Please upload one.</p>
                    </div>
                </div>
            </div>
        </div >}

        {/* TODO: Add crypted field */}
        {/* <CryptedField /> */}

        <div className="form-group">
            <label className="text-gray-500 text-sm font-normal">
                You can specify import file upload options for your file. See how this is done for <a
                    href="https://pandas.pydata.org/docs/reference/api/pandas.read_json.html" target="_blank"><span
                        className="underline cursor-pointer">JSON</span></a>, <a
                            href="https://pandas.pydata.org/docs/reference/api/pandas.read_csv.html" target="_blank"><span
                                className="underline cursor-pointer">CSV</span></a> and <a
                                    href="https://pandas.pydata.org/docs/reference/api/pandas.read_excel.html" target="_blank"><span
                                        className="underline cursor-pointer">spreadsheets</span></a>. If you leave
                it blank, we&apos;ll use default settings
            </label>
            <div>
                <textarea value={importOptions} ref={textareaRef} className="shadow mt-1 p-4 text-sm w-full placeholder-indigo rounded-md" rows={3}
                    placeholder={`E.g. for uncommon CSV ${'\n'} sep=t ${'\n'} lineterminator=r`}
                    onChange={() => dispatch(setImportOptions(textareaRef.current?.value))}></textarea>
            </div>
        </div>

        {/* TODO: check the condition if the embeddings that are recreated will cost */}
        {
            uploadFileType == UploadFileType.RECORDS_ADD && <div className="text-sm text-gray-500 font-normal">
                <strong className="text-sm text-gray-700 font-medium">CAUTION:</strong> Submitting new records will automatically
                run attribute calculation and embeddings (recreation of
                the
                embeddings will calculate them one more time and could cause additional fees)
                for all records
            </div>
        }

        {
            !props.isModal && <div className="mt-4 flex flex-row gap-x-2">
                <button onClick={props.submitUpload} type="submit"
                    className="bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-md hover:bg-blue-800 focus:outline-none opacity-100 cursor-pointer">
                    Proceed
                </button>
                <button type="button" onClick={() => uploadFileType == UploadFileType.RECORDS_NEW ? router.push('/projects') : router.push('../settings')}
                    className="bg-red-100 border border-red-400 text-red-700 text-xs font-semibold px-4 py-2 rounded-md cursor-pointer hover:bg-red-200 focus:outline-none">
                    {uploadFileType == UploadFileType.RECORDS_NEW ? 'Cancel project creation' : 'Cancel'}
                </button>
            </div >
        }
    </>)
}