import { UploadFileType, UploadWrapperProps } from "@/src/types/shared/upload";
import CryptedField from "./CryptedField";
import FileValidation from "./FileValidation";
import UploadField from "./UploadField";
import { useRef } from "react";
import { useSelector } from "react-redux";
import { selectUploadData, setImportOptions } from "@/src/reduxStore/states/upload";
import { useRouter } from "next/router";

export default function UploadWrapper(props: UploadWrapperProps) {
    const router = useRouter();
    const uploadFileType = useSelector(selectUploadData).uploadFileType;
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    function submitUploadFile() {
        props.submitUpload();
    }

    return (<>
        <UploadField uploadStarted={props.uploadStarted} doingSomething={props.doingSomething} uploadTask={props.uploadTask} progressState={props.progressState} sendSelectedFile={(file) => props.sendSelectedFile(file)} />
        <FileValidation />
        <CryptedField />
        <div className="form-group">
            <label className="text-gray-500 text-sm font-normal">
                You can specify import file upload options for your file. See how this is done for <a
                    href="https://pandas.pydata.org/docs/reference/api/pandas.read_json.html" target="_blank"><span
                        className="underline cursor-pointer">JSON</span></a>, <a
                            href="https://pandas.pydata.org/docs/reference/api/pandas.read_csv.html" target="_blank"><span
                                className="underline cursor-pointer">CSV</span></a> and <a
                                    href="https://pandas.pydata.org/docs/reference/api/pandas.read_excel.html" target="_blank"><span
                                        className="underline cursor-pointer">spreadsheets</span></a>. If you leave
                it blank, we'll use default settings
            </label>
            <div>
                <textarea ref={textareaRef} className="shadow mt-1 p-4 text-sm w-full placeholder-indigo rounded-md" rows={3}
                    placeholder={`E.g. for uncommon CSV ${'\n'} sep=t ${'\n'} lineterminator=r`}
                    onChange={() => setImportOptions(textareaRef.current?.value)}></textarea>
            </div>
        </div>

        {uploadFileType == UploadFileType.RECORDS_ADD && <div className="text-sm text-gray-500 font-normal">
            <strong className="text-sm text-gray-700 font-medium">CAUTION:</strong> Submitting new records will automatically
            run attribute calculation and embeddings (recreation of
            the
            embeddings will calculate them one more time and could cause additional fees)
            for all records
        </div>}

        {!props.isModal && <div className="mt-4 flex flex-row gap-x-2">
            <button onClick={submitUploadFile} type="submit"
                className="bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-md hover:bg-blue-800 focus:outline-none opacity-100 cursor-pointer">
                Proceed
            </button>
            <button type="button" onClick={() => uploadFileType == UploadFileType.RECORDS_NEW ? router.push('/projects') : router.push('../settings')}
                className="bg-red-100 border border-red-400 text-red-700 text-xs font-semibold px-4 py-2 rounded-md cursor-pointer hover:bg-red-200 focus:outline-none">
                {uploadFileType == UploadFileType.RECORDS_NEW ? 'Cancel project creation' : 'Cancel'}
            </button>
        </div >}
    </>)
}