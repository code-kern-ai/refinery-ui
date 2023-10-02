import Modal from "@/src/components/shared/modal/Modal";
import Statuses from "@/src/components/shared/statuses/Statuses"
import { openModal } from "@/src/reduxStore/states/modal";
import { selectProject } from "@/src/reduxStore/states/project";
import { WebSocketsService } from "@/src/services/base/web-sockets/WebSocketsService";
import { UPDATE_PROJECT_FOR_GATES } from "@/src/services/gql/mutations/project";
import { GET_GATES_INTEGRATION_DATA } from "@/src/services/gql/queries/project";
import { CurrentPage } from "@/src/types/shared/general";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { GatesIntegratorStatus } from "@/src/types/shared/statuses";
import { useLazyQuery, useMutation } from "@apollo/client";
import { IconReload } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const ACCEPT_BUTTON = { buttonCaption: 'Accept', useButton: true, disabled: false };

export default function GatesIntegration() {
    const dispatch = useDispatch();

    const project = useSelector(selectProject);

    const [gatesIntegrationData, setGatesIntegrationData] = useState(null);
    const [gatesLink, setGatesLink] = useState(null);

    const [refetchGatesIntegrationData] = useLazyQuery(GET_GATES_INTEGRATION_DATA, { fetchPolicy: 'no-cache' });
    const [updateProjectsGatesMut] = useMutation(UPDATE_PROJECT_FOR_GATES);

    useEffect(() => {
        setGatesLink(window.location.origin + '/gates/project/' + project.id + "/prediction");
        refetchAndSetGatesIntegrationData();
        WebSocketsService.subscribeToNotification(CurrentPage.SETTINGS, {
            projectId: project.id,
            whitelist: ['gates_integration', 'information_source_deleted', 'information_source_updated', 'tokenization', 'embedding', 'embedding_deleted'],
            func: handleWebsocketNotification
        })
    }, []);

    const updateProjectForGates = useCallback(() => {
        updateProjectsGatesMut({ variables: { projectId: project.id } }).then(() => { });
    }, []);

    useEffect(() => {
        setAcceptButton({ ...ACCEPT_BUTTON, emitFunction: updateProjectForGates });
    }, [updateProjectForGates]);

    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);

    function refetchAndSetGatesIntegrationData() {
        refetchGatesIntegrationData({ variables: { projectId: project.id } }).then((res) => {
            setGatesIntegrationData(res.data['getGatesIntegrationData']);
        });
    }

    function handleWebsocketNotification(msgParts: string[]) {
        if (msgParts[1] == 'gates_integration') {
            refetchAndSetGatesIntegrationData();
        } else if (['information_source_deleted', 'information_source_updated'].includes(msgParts[1])) {
            if (gatesIntegrationData?.missingInformationSources?.includes(msgParts[2])) {
                refetchAndSetGatesIntegrationData();
            }
        } else if (msgParts[1] == 'tokenization' && msgParts[2] == 'docbin' && msgParts[3] == 'state' && msgParts[4] == 'FINISHED') {
            refetchAndSetGatesIntegrationData();
        } else if (msgParts[1] == 'embedding' && msgParts[3] == 'state' && msgParts[4] == 'FINISHED') {
            if (gatesIntegrationData?.missingEmbeddings?.includes(msgParts[2])) {
                refetchAndSetGatesIntegrationData();
            }
        } else if (msgParts[1] == 'embedding_deleted') {
            if (gatesIntegrationData?.missingEmbeddings?.includes(msgParts[2])) {
                refetchAndSetGatesIntegrationData();
            }
        }
    }

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
                    This will rerun the project's embeddings and heuristics to create the necessary data for Gates.
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