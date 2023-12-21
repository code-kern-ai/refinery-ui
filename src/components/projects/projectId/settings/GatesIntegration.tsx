import Modal from "@/src/components/shared/modal/Modal";
import Statuses from "@/src/components/shared/statuses/Statuses"
import { openModal } from "@/src/reduxStore/states/modal";
import { selectGatesIntegration } from "@/src/reduxStore/states/pages/settings";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { unsubscribeWSOnDestroy } from "@/src/services/base/web-sockets/web-sockets-helper";
import { UPDATE_PROJECT_FOR_GATES } from "@/src/services/gql/mutations/project-settings";
import { CurrentPage } from "@/src/types/shared/general";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { GatesIntegratorStatus } from "@/src/types/shared/statuses";
import { useMutation } from "@apollo/client";
import { IconReload } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const ACCEPT_BUTTON = { buttonCaption: 'Accept', useButton: true, disabled: false };

export default function GatesIntegration(props: { refetchWS: () => void }) {
    const router = useRouter();
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const gatesIntegrationData = useSelector(selectGatesIntegration);

    const [gatesLink, setGatesLink] = useState(null);

    const [updateProjectsGatesMut] = useMutation(UPDATE_PROJECT_FOR_GATES);

    useEffect(unsubscribeWSOnDestroy(router, [CurrentPage.PROJECT_SETTINGS]), []);

    useEffect(() => {
        setGatesLink(window.location.origin + '/gates/project/' + projectId + "/prediction");
    }, []);

    const updateProjectForGates = useCallback(() => {
        updateProjectsGatesMut({ variables: { projectId: projectId } }).then(() => {
            props.refetchWS();
        });
    }, []);

    useEffect(() => {
        setAcceptButton({ ...ACCEPT_BUTTON, emitFunction: updateProjectForGates });
    }, [updateProjectForGates]);

    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);

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
                {gatesIntegrationData?.status === GatesIntegratorStatus.READY && <span>This project is ready to be used with Gates. You can switch to the <a href={gatesLink}><span
                    className="underline cursor-pointer">Gates App</span></a> to configure and run
                    it.</span>}

                {gatesIntegrationData?.status === GatesIntegratorStatus.UPDATING && <span>This project is currently updated to be used with Gates.</span>}
                {gatesIntegrationData?.status === GatesIntegratorStatus.NOT_READY && <span> This project is not ready to be used with Gates. You can update the project to make it ready.
                    This will rerun the project&apos;s embeddings and heuristics to create the necessary data for Gates.
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

        <Modal modalName={ModalEnum.GATES_INTEGRATION_WARNING} acceptButton={acceptButton}>
            <h1 className="text-lg text-gray-900 mb-2">Confirmation</h1>
            <div className="text-sm text-gray-500 my-2">
                Are you sure you want to run the gates integration?
                <p>Recreation of the
                    embeddings will calculate them one more time and could cause additional fees.</p>
            </div>
        </Modal>
    </div >
    )
}