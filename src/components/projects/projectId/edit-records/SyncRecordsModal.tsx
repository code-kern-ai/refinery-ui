import LoadingIcon from "@/src/components/shared/loading/LoadingIcon";
import Modal from "@/src/components/shared/modal/Modal";
import { selectModal, setModalStates } from "@/src/reduxStore/states/modal";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { EDIT_RECORDS } from "@/src/services/gql/mutations/edit-records";
import { SyncRecordsModalProps } from "@/src/types/components/projects/projectId/edit-records";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import { useMutation } from "@apollo/client";
import { IconAlertTriangleFilled, IconInfoCircle, IconTrash } from "@tabler/icons-react";
import { Fragment, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const ACCEPT_BUTTON = { buttonCaption: 'Synchronize', useButton: true, disabled: false, closeAfterClick: false };

export default function SyncRecordsModal(props: SyncRecordsModalProps) {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const syncRecordsModal = useSelector(selectModal(ModalEnum.SYNC_RECORDS));

    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);

    const [syncChangesMut] = useMutation(EDIT_RECORDS);

    const syncChanges = useCallback(() => {
        const erdDataCopy = { ...props.erdData };
        erdDataCopy.syncing = true;
        erdDataCopy.errors = null;
        const changes = jsonCopy(erdDataCopy.cachedRecordChanges);
        for (const key in changes) delete changes[key].display;
        syncChangesMut({ variables: { projectId: projectId, changes: JSON.stringify(changes) } }).then((res) => {
            const tmp = res?.data?.editRecords;
            if (tmp?.ok) {
                erdDataCopy.data.records = jsonCopy(erdDataCopy.displayRecords);
                erdDataCopy.cachedRecordChanges = {};
                dispatch(setModalStates(ModalEnum.SYNC_RECORDS, { syncModalAmount: Object.keys(erdDataCopy.cachedRecordChanges).length }));
            } else {
                if (tmp) erdDataCopy.errors = tmp.errors;
                else erdDataCopy.errors = ["Request didn't go through"];
            }
            erdDataCopy.syncing = false;
            props.setErdData(erdDataCopy);
        }).catch((err) => {
            erdDataCopy.errors = ["Request didn't go through"];
            erdDataCopy.syncing = false;
            props.setErdData(erdDataCopy);
        });
    }, [props.erdData]);

    useEffect(() => {
        setAcceptButton({ ...ACCEPT_BUTTON, disabled: syncRecordsModal.syncModalAmount == 0 || props.erdData.syncing, emitFunction: syncChanges });
    }, [syncRecordsModal]);

    function removeFromCache(key: string) {
        const erdDataCopy = { ...props.erdData };
        const keyParts = key.split("@");
        const recordId = keyParts[0];
        const r1 = erdDataCopy.displayRecords.find((record) => record.id == recordId);
        const r2 = erdDataCopy.data.records.find((record) => record.id == recordId);
        if (!r1 || !r2) return;
        const attributeName = keyParts[1];
        const subKey = keyParts.length == 3 ? parseInt(keyParts[2]) : null;
        if (subKey != undefined) r1.data[attributeName][subKey] = r2.data[attributeName][subKey];
        else r1.data[attributeName] = r2.data[attributeName];

        delete erdDataCopy.cachedRecordChanges[key];
        dispatch(setModalStates(ModalEnum.SYNC_RECORDS, { syncModalAmount: Object.keys(erdDataCopy.cachedRecordChanges).length }));
        props.setErdData(erdDataCopy);
    }

    return (<Modal modalName={ModalEnum.SYNC_RECORDS} acceptButton={acceptButton}>
        {props.erdData && <>
            <h1 className="text-lg text-gray-900 mb-2 text-center inline-flex items-center gap-x-1">Info
                {props.erdData.syncing ? (<LoadingIcon color="blue" />) : (<IconInfoCircle className="text-blue-400" />)}
            </h1>
            <div className="text-sm text-gray-700 flex flex-col gap-y-2 mb-2 font-medium">
                <div> {syncRecordsModal.syncModalAmount} changes to be synchronized: </div>
                <div className="grid gap-px p-px bg-gray-200 rounded-lg" style={{ gridTemplateColumns: 'minmax(auto,100px) max-content minmax(auto,300px) minmax(auto,300px) 50px' }}>
                    <span className="bg-white font-bold h-full w-full inline-flex items-center justify-center">Record
                        ({props.erdData.data?.attributes[0].name})</span>
                    <span className="bg-white font-bold h-full w-full inline-flex items-center justify-center">Attribute</span>
                    <span className="bg-white font-bold h-full w-full inline-flex items-center justify-center">Old value</span>
                    <span className="bg-white font-bold h-full w-full inline-flex items-center justify-center">New value</span>
                    <span className="bg-white h-full w-full"></span>

                    {Object.entries(props.erdData.cachedRecordChanges).map(([key, value]: any) => (<Fragment key={key}>
                        <span className="bg-white h-full w-full p-1 inline-flex items-center justify-center">{value.display.record}</span>
                        <span className="bg-white h-full w-full p-1 inline-flex items-center justify-center">{value.attributeName}{value.display.subKeyAdd}</span>
                        <span className="h-full w-full p-1 inline-flex items-center justify-center bg-red-200">{value.display.oldValue}</span>
                        <span className="h-full w-full p-1 inline-flex items-center justify-center bg-green-200">{value.newValue}</span>
                        <div className="bg-white h-full w-full p-1 inline-flex items-center justify-center cursor-pointer" onClick={() => removeFromCache(key)}>
                            <IconTrash className="text-red-700 h-6 w-6" stroke={2} />
                        </div>
                    </Fragment>))}
                </div>
            </div>
            {props.erdData.errors && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex flex-col">
                <div className="self-center flex flex-row flex-nowrap items-center -mt-1 mb-1">
                    <strong className="font-bold">Errors while syncing changes</strong>
                    <IconAlertTriangleFilled className="h-5 w-5 text-red-400" />
                </div>
                {props.erdData.errors.map((error, index) => <div key={error} className="text-sm overflow-x-auto m-auto" style={{ maxWidth: '600px' }}>
                    {error}
                </div>)}
            </div>}
        </>}
    </Modal>)
}