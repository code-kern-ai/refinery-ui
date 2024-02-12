import Statuses from "@/src/components/shared/statuses/Statuses"
import { openModal } from "@/src/reduxStore/states/modal";
import { selectGatesIntegration } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { unsubscribeWSOnDestroy } from "@/src/services/base/web-sockets/web-sockets-helper";
import { CurrentPage } from "@/src/types/shared/general";
import { ModalEnum } from "@/src/types/shared/modal";
import { GatesIntegratorStatus } from "@/src/types/shared/statuses";
import { IconReload } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import GatesIntegrationWarningModal from "./GatesIntegrationWarningModal";

export default function GatesIntegration() {
    const router = useRouter();
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const gatesIntegrationData = useSelector(selectGatesIntegration);

    const [gatesLink, setGatesLink] = useState(null);

    useEffect(() => {
        setGatesLink(window.location.origin + '/gates/project/' + projectId + "/prediction");
    }, []);

    return (<div className="mt-8">
        <div className="text-lg leading-6 text-gray-900 font-medium inline-flex items-center">
            <span className="mr-2">
                Gates integration
            </span>
            <Statuses page="gates-integrator" status={gatesIntegrationData?.status} />
        </div>
        <div className="mt-1">
            <div className="text-sm leading-5 font-medium text-gray-700 inline-block">
                Gates is the inference API for refinery.
                {gatesIntegrationData?.status === GatesIntegratorStatus.READY && <span> This project is ready to be used with Gates. You can switch to the <a href={gatesLink}><span
                    className="underline cursor-pointer">Gates App</span></a> to configure and run
                    it.</span>}

                {gatesIntegrationData?.status === GatesIntegratorStatus.UPDATING && <span> This project is currently updated to be used with Gates.</span>}
                {gatesIntegrationData?.status === GatesIntegratorStatus.NOT_READY && <span> This project is not ready to be used with Gates. You can update the project to make it ready.
                    <span> This will rerun the project&apos;s embeddings and heuristics to create the necessary data for Gates.</span>
                    <button type="button" onClick={() => dispatch(openModal(ModalEnum.GATES_INTEGRATION_WARNING))}
                        className="mr-1 mt-2 flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-semibold rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer">
                        <IconReload className="h-4 w-4" />
                        <span className="leading-5 ml-1">
                            Update Project
                        </span>
                    </button>
                </span>}
            </div >
        </div >
        <GatesIntegrationWarningModal />
    </div >
    )
}