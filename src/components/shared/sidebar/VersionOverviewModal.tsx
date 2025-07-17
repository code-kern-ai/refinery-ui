import { ModalEnum } from "@/src/types/shared/modal";
import Modal from "../modal/Modal";
import { useSelector } from "react-redux";
import { CacheEnum, selectCachedValue } from "@/src/reduxStore/states/cachedValues";
import style from '@/src/styles/shared/sidebar.module.css';
import LoadingIcon from "../../../../submodules/react-components/components/LoadingIcon";
import { useEffect, useMemo, useState } from "react";
import KernTable from "@/submodules/react-components/components/kern-table/KernTable";
import { prepareTableBodyVersionOverview, VERSION_OVERVIEW_TABLE_COLUMNS } from "@/src/util/table-preparations/version-overview";
import { MemoIconArrowRight } from "@/submodules/react-components/components/kern-icons/icons";


export default function VersionOverviewModal() {
    const versionOverviewData = useSelector(selectCachedValue(CacheEnum.VERSION_OVERVIEW));

    const preparedValues = useMemo(() => prepareTableBodyVersionOverview(versionOverviewData), [versionOverviewData])

    return (<Modal modalName={ModalEnum.VERSION_OVERVIEW}>
        <div className="inline-block justify-center text-lg leading-6 text-gray-900 font-medium">
            Version overview

            <a className="text-green-800 text-base font-medium ml-3" href="https://changelog.kern.ai/" target="_blank">
                <span className="leading-5">Changelog</span>
                <MemoIconArrowRight className="h-4 w-4 inline-block text-green-800" />
            </a>
        </div>
        {versionOverviewData ? (<div className="inline-block min-w-full align-middle mt-3">
            <div className={`overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg ${style.scrollableSize}`}>
                <KernTable
                    headers={VERSION_OVERVIEW_TABLE_COLUMNS}
                    values={preparedValues}
                />
            </div>
        </div>) : (<LoadingIcon />)}
    </Modal>)
}