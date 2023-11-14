import Modal from "@/src/components/shared/modal/Modal";
import { selectIsManaged } from "@/src/reduxStore/states/general";
import { selectModal } from "@/src/reduxStore/states/modal";
import { removeFromAllDataSlicesById } from "@/src/reduxStore/states/pages/data-browser";
import { selectProject } from "@/src/reduxStore/states/project";
import { DELETE_DATA_SLICE } from "@/src/services/gql/mutations/data-browser";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { parseLinkFromText } from "@/src/util/shared/link-parser-helper";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { copyToClipboard } from "@/submodules/javascript-functions/general";
import { useMutation } from "@apollo/client";
import { Tooltip } from "@nextui-org/react";
import { useRouter } from "next/router";
import { Fragment, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const ABORT_BUTTON = { buttonCaption: 'Delete', useButton: true, disabled: false };

export default function DataBrowserModals() {
    // i think we need to split this into multiple files since a change in modal a would trigger a rerender of all modals
    const dispatch = useDispatch();
    const router = useRouter();

    const project = useSelector(selectProject);
    const isManaged = useSelector(selectIsManaged);
    const modalSliceInfo = useSelector(selectModal(ModalEnum.DATA_SLICE_INFO));
    const modalDeleteSlice = useSelector(selectModal(ModalEnum.DELETE_SLICE));
    const modalUserInfo = useSelector(selectModal(ModalEnum.USER_INFO));

    const [deleteDataSliceMut] = useMutation(DELETE_DATA_SLICE);

    const deleteDataSlice = useCallback(() => {
        // since this only needs the sliceId and projectId i would assume this to be function outside the component with parameters to ensure a stable function pointer (so no need for useCallback)
        deleteDataSliceMut({ variables: { projectId: project.id, dataSliceId: modalDeleteSlice.sliceId } }).then((res) => {
            dispatch(removeFromAllDataSlicesById(modalDeleteSlice.sliceId));
        });
    }, [modalDeleteSlice]);

    useEffect(() => {
        setAbortButton({ ...abortButton, emitFunction: deleteDataSlice });
    }, [modalDeleteSlice]);

    const [abortButton, setAbortButton] = useState<ModalButton>(ABORT_BUTTON);

    function testLink(link) {
        const linkData = parseLinkFromText(link);
        router.push(linkData.route, { query: linkData.queryParams });
    }

    return (<>
        <Modal modalName={ModalEnum.DELETE_SLICE} abortButton={abortButton}>
            <h1 className="text-lg text-gray-900 mb-2 text-center">Warning</h1>
            <div className="text-sm text-gray-500 my-2 text-center">
                Are you sure you want to delete this data slice?
            </div>
        </Modal>

        <Modal modalName={ModalEnum.DATA_SLICE_INFO}>
            <div className="flex flex-grow justify-center mb-4 font-bold">Slice information</div>
            {modalSliceInfo.sliceInfo && Object.entries(modalSliceInfo.sliceInfo).map(([key, value]: any) => (
                <Fragment key={key}>
                    {key == "Link" ? (<div>
                        <div className="mt-3 flex rounded-md">
                            <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">{value.startsWith("https") ? 'https://' : 'http://'}</span>
                            <Tooltip content={TOOLTIPS_DICT.DATA_BROWSER.COPY_TO_CLIPBOARD} color="invert" placement="top">
                                <span onClick={() => copyToClipboard(value + '?pos=1&type=DATA_SLICE')}
                                    className="cursor-pointer tooltip border rounded-none rounded-r-md border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                                    {value.substring(value.startsWith("https") ? 8 : 7)}</span>
                            </Tooltip>
                        </div>
                        <Tooltip content={TOOLTIPS_DICT.DATA_BROWSER.ONLY_MANAGED} color="invert" placement="right">
                            <button onClick={() => testLink(value + '?pos=1&type=DATA_SLICE')} disabled={!isManaged}
                                className="mt-3 opacity-100 w-40 bg-indigo-700 text-white text-xs leading-4 font-semibold px-4 py-2 rounded-md cursor-pointer hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                View as expert
                            </button>
                        </Tooltip>
                    </div>) : (<div className="flex flex-grow justify-between gap-8">
                        <p>{key}</p>
                        <p>{value}</p>
                    </div>)}
                </Fragment>
            ))}
        </Modal>

        <Modal modalName={ModalEnum.USER_INFO}>
            <h1 className="text-lg text-gray-900 mb-2 text-center">Info</h1>
            {modalUserInfo && modalUserInfo.userInfo && <div className="flex-grow items-center flex flex-col mb-2">
                <div className="mb-4">{modalUserInfo.userInfo.mail}</div>
                {!modalUserInfo.userInfo.countSum && <div className="text-gray-500 italic"> No labels associated with this user.</div>}
                <div className="grid gap-x-4 gap-y-2" style={{ gridTemplateColumns: 'max-content max-content' }}>
                    {modalUserInfo.userInfo.counts && modalUserInfo.userInfo.counts.map((pair) => (<div key={pair.source} className="contents">
                        <div className="text-base text-gray-900 font-semibold">{pair.source}</div>
                        <div className="text-base text-gray-500 font-normal">{pair.count + ' record' + (pair.count > 1 ? 's' : '')}</div>
                    </div>))}
                    {modalUserInfo.userInfo.counts > 1 && <div className="contents">
                        <div className="text-base text-gray-900 font-semibold mt-2">Sum</div>
                        <div className="text-base text-gray-500 font-normal mt-2">{modalUserInfo.userInfo.countSum + ' record' + (modalUserInfo.userInfo.countSum > 1 ? 's' : '')}</div>
                    </div>}
                </div>
            </div>}
        </Modal>

        <Modal modalName={ModalEnum.CONFIGURATION}></Modal>

        <Modal modalName={ModalEnum.RECORD_COMMENTS}></Modal>
    </>)
}