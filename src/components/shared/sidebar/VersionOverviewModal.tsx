import { ModalEnum } from "@/src/types/shared/modal";
import Modal from "../modal/Modal";
import { IconAlertCircle, IconArrowRight, IconExternalLink } from "@tabler/icons-react";
import { useSelector } from "react-redux";
import { CacheEnum, selectCachedValue } from "@/src/reduxStore/states/cachedValues";
import style from '@/src/styles/shared/sidebar.module.css';
import { VersionOverview } from "@/src/types/shared/sidebar";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { Tooltip } from "@nextui-org/react";
import LoadingIcon from "../../../../submodules/react-components/components/LoadingIcon";
import { useEffect, useState } from "react";
import KernTable from "@/submodules/react-components/components/kern-table/KernTable";
import { prepareTableBodyVersionOverview, VERSION_OVERVIEW_TABLE_COLUMNS } from "@/src/util/table-preparations/version-overview";


export default function VersionOverviewModal() {
    const versionOverviewData = useSelector(selectCachedValue(CacheEnum.VERSION_OVERVIEW));

    const [preparedValues, setPreparedValues] = useState([]);

    useEffect(() => {
        if (!versionOverviewData) return;
        setPreparedValues(prepareTableBodyVersionOverview(versionOverviewData));
    }, [versionOverviewData]);

    return (<Modal modalName={ModalEnum.VERSION_OVERVIEW}>
        <div className="inline-block justify-center text-lg leading-6 text-gray-900 font-medium">
            Version overview

            <a className="text-green-800 text-base font-medium ml-3" href="https://changelog.kern.ai/" target="_blank">
                <span className="leading-5">Changelog</span>
                <IconArrowRight className="h-4 w-4 inline-block text-green-800" />
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