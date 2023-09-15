import { UploadFileType, UploadProps } from "@/src/types/shared/upload";
import { useSelector } from "react-redux";
import UploadField from "./helper-components/UploadField";
import CryptedField from "./helper-components/CryptedField";
import { useState } from "react";
import Dropdown from "@/submodules/react-components/components/Dropdown";
import UploadWrapper from "./helper-components/UploadWrapper";
import { selectUploadData } from "@/src/reduxStore/states/upload";
import { useMutation } from "@apollo/client";
import { CREATE_PROJECT } from "@/src/services/gql/mutations/projects";
import { setActiveProject } from "@/src/reduxStore/states/project";

const SELECTED_TOKENIZER = 'English (en_core_web_sm)';

export default function Upload(props: UploadProps) {
    const uploadFileType = useSelector(selectUploadData).uploadFileType;

    const [projectTitle, setProjectTitle] = useState<string>("");
    const [projectDescription, setProjectDescription] = useState<string>("");
    const [submitted, setSubmitted] = useState<boolean>(false);

    const [createProjectMut] = useMutation(CREATE_PROJECT);

    function submitUpload() {
        setSubmitted(true);
        if (uploadFileType == UploadFileType.RECORDS_NEW) {
            createProjectMut({ variables: { name: projectTitle, description: projectDescription } }).then((res) => {
                const project = res.data.createProject['project'];
                setActiveProject(project);
            })
        }
    }

    return (
        <section className={`${!props.uploadOptions.isModal ? 'p-4' : ''}`}>
            {uploadFileType == UploadFileType.PROJECT && (<>
                <UploadField />
                <CryptedField />
                {props.uploadOptions.showBadPasswordMsg && (<div className="text-red-700 text-xs mt-2 text-center">Wrong password</div>)}
            </>
            )}
            {uploadFileType == UploadFileType.RECORDS_NEW && (<>
                <div className="form-control">
                    <label className="text-gray-500 text-sm font-normal">Project title</label>

                    <div className="flex flex-row">
                        {/* TODO : add on enter to create a new project */}
                        <input type="text" value={projectTitle} onInput={(e: any) => setProjectTitle(e.target.value)}
                            className="h-9 w-full border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" placeholder="Enter some title here..." />
                    </div>
                </div>
                <div className="form-control mt-6">
                    <label className="text-gray-500 text-sm font-normal">Project description <em>- optional</em></label>
                    <textarea value={projectDescription} onInput={(e: any) => setProjectDescription(e.target.value)}
                        className="h-9 w-full border-gray-300 rounded-md leading-8 placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" placeholder="Enter some description here..."></textarea>
                </div>
                <div className="form-control mt-6">
                    <label className="text-gray-500 text-sm font-normal">
                        Please choose a tokenizer for your project. See our <a
                            href="https://docs.kern.ai/refinery/project-creation-and-data-upload" target="_blank"><span
                                className="underline cursor-pointer">documentation</span></a> for further
                        details.
                    </label>
                    {/* TODO add missing properties */}
                    <Dropdown buttonName={SELECTED_TOKENIZER} options={props.uploadOptions.tokenizerValues} />
                </div>
                <UploadWrapper isModal={props.uploadOptions.isModal} submitUpload={submitUpload} />
            </>
            )}
        </section>
    )
}
