import Modal from "@/src/components/shared/modal/Modal";
import { selectIsManaged } from "@/src/reduxStore/states/general";
import { selectModal } from "@/src/reduxStore/states/modal";
import { ModalEnum } from "@/src/types/shared/modal";
import { parseLinkFromText } from "@/src/util/shared/link-parser-helper";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { copyToClipboard } from "@/submodules/javascript-functions/general";
import { Tooltip } from "@nextui-org/react";
import { useRouter } from "next/router";
import { Fragment } from "react";
import { useSelector } from "react-redux";

export default function DataSliceInfoModal() {
    const router = useRouter();


    const isManaged = useSelector(selectIsManaged);
    const modalSliceInfo = useSelector(selectModal(ModalEnum.DATA_SLICE_INFO));

    function testLink(link) {
        const linkData = parseLinkFromText(link);
        router.push(linkData.fullUrl);
    }

    return (<Modal modalName={ModalEnum.DATA_SLICE_INFO}>
        <div className="flex flex-grow justify-center mb-4 font-bold">Slice information</div>
        {modalSliceInfo.sliceInfo && Object.entries(modalSliceInfo.sliceInfo).map(([key, value]: any) => (
            <Fragment key={key}>
                {key == "Link" ? (<div>
                    <div className="mt-3 flex rounded-md">
                        <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">{value.startsWith("https") ? 'https://' : 'http://'}</span>
                        <Tooltip content={TOOLTIPS_DICT.GENERAL.CLICK_TO_COPY} color="invert" placement="top">
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
    </Modal>)
}