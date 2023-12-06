import { selectProjectId } from "@/src/reduxStore/states/project"
import { useSelector } from "react-redux"
import NavBarTopEditRecords from "./NavBarTopEditRecords";
import { selectSessionData } from "@/src/reduxStore/states/tmp";
import { Fragment, useEffect, useState } from "react";
import { buildAccessKey, createDefaultEditRecordComponentData } from "@/src/util/components/projects/projectId/edit-records-helper";
import style from '@/src/styles/components/projects/projectId/edit-records.module.css';
import { scrollElementIntoView } from "@/submodules/javascript-functions/scrollHelper";
import { DataTypeEnum } from "@/src/types/shared/general";
import { IconAlertCircle, IconAlertTriangle, IconAlertTriangleFilled, IconBallpen, IconBallpenOff } from "@tabler/icons-react";
import { Tooltip } from "@nextui-org/react";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import EditField from "./EditField";

export default function EditRecords() {
    const projectId = useSelector(selectProjectId);
    const sessionData = useSelector(selectSessionData);

    const [erdData, setErdData] = useState(createDefaultEditRecordComponentData());

    useEffect(() => {
        if (!sessionData) return;
        const erdDataCopy = { ...erdData };
        erdDataCopy.data = sessionData;
        erdDataCopy.displayRecords = erdDataCopy.data.records;
        erdDataCopy.editRecordId = erdDataCopy.data.selectedRecordId;
        erdDataCopy.navBar.positionString = erdDataCopy.data.records.length + " records in";
        setErdData(erdDataCopy);
        scrollElementIntoView("flash-it", 50);
    }, [sessionData]);

    return (<>{projectId && <div className="h-screen bg-white flex flex-col">
        <NavBarTopEditRecords erdData={erdData} setErdData={(erdData) => setErdData(erdData)} />
        <div className={`grid items-start p-2 gap-2 flex-grow overflow-y-auto auto-rows-max ${erdData.columnClass}`} style={{ maxHeight: 'calc(100vh - 95px)' }}>
            {erdData.data && <>
                {erdData.displayRecords.map((record) =>
                    <div key={record.id} className={`relative space-x-3 items-center bg-white overflow-hidden shadow rounded-lg border w-full scroll-mt-8 ${erdData.displayRecords?.length > 2 ? style.item : ''}`}
                        onDoubleClick={() => {
                            if (erdData.editRecordId === record.id) return;
                            const erdDataCopy = { ...erdData };
                            erdDataCopy.editRecordId = record.id;
                            setErdData(erdDataCopy);
                        }} id={record.id == erdData.data.selectedRecordId ? 'flash-id' : null}>
                        <div className="px-4 py-5 sm:p-6">
                            {erdData.data.attributes.map((attribute) => (<Fragment key={attribute.id}>
                                <div>
                                    <div className="font-semibold text-sm text-gray-800">
                                        <div className="flex flex-row items-center">
                                            <span className="font-dmMono">{attribute.name}</span>
                                        </div>
                                    </div>
                                    <div className="text-gray-800 text-sm mb-4 overflow-anywhere flex">
                                        {attribute.dataType == DataTypeEnum.EMBEDDING_LIST ? (<div className="flex flex-col gap-y-1 divide-y w-full">
                                            {record.data[attribute.name].map((item, subKey) => (<div key={subKey} className="pt-1">
                                                {(record.id == erdData.editRecordId && !attribute.isPrimary) ? <EditField attribute={attribute} record={record} subKey={subKey} erdData={erdData} setErdData={(erdData) => setErdData(erdData)} /> : <>
                                                    {item != null && item !== '' ? (<span className="whitespace-pre-wrap">
                                                        <span>{item}</span>
                                                    </span>) : (<NotPresentInRecord />)}
                                                </>}
                                            </div>))}
                                        </div>) : (<>
                                            {(record.id == erdData.editRecordId && !attribute.isPrimary) ? <EditField attribute={attribute} record={record} erdData={erdData} setErdData={(erdData) => setErdData(erdData)} /> : <>
                                                {record.data[attribute.name] != null && record.data[attribute.name] !== '' ? (<span className="whitespace-pre-wrap relative">
                                                    <span>{record.data[attribute.name]}</span>
                                                    {erdData.cachedRecordChanges[buildAccessKey(record.id, attribute.name)] && <div className="absolute -left-5 top-0 text-yellow-500">
                                                        <Tooltip content={TOOLTIPS_DICT.EDIT_RECORDS.CACHED_VALUES} color="invert" placement="right">
                                                            <IconAlertTriangleFilled size={16} stroke={2} />
                                                        </Tooltip>
                                                    </div>}
                                                </span>) : <NotPresentInRecord />}
                                            </>}
                                        </>)}
                                    </div>
                                </div>
                            </Fragment>))}
                            <div className="absolute top-2 right-2 flex flex-row flex-nowrap items-center gap-x-2">
                                {record.rla_data && <Tooltip content={TOOLTIPS_DICT.EDIT_RECORDS.LABEL_ASSOCIATIONS} color="invert" placement="left" className="cursor-auto">
                                    <IconAlertTriangle size={18} stroke={2} />
                                </Tooltip>}
                            </div>
                            <div className="absolute left-1 top-1 p-1 cursor-pointer" onClick={() => {
                                if (record.id == erdData.editRecordId) return;
                                const erdDataCopy = { ...erdData };
                                erdDataCopy.editRecordId = record.id;
                                setErdData(erdDataCopy);
                            }}>
                                {record.id == erdData.editRecordId ?
                                    (<Tooltip content={TOOLTIPS_DICT.EDIT_RECORDS.STOP_EDIT} color="invert" placement="right">
                                        <IconBallpenOff size={18} stroke={2} />
                                    </Tooltip>) :
                                    (<Tooltip content={TOOLTIPS_DICT.EDIT_RECORDS.EDIT_RECORD} color="invert" placement="right">
                                        <IconBallpen size={18} />
                                    </Tooltip>)}
                            </div>
                        </div>
                    </div>)}</>}
        </div>
    </div>}</>)
}

function NotPresentInRecord() {
    return (<div className="flex items-center">
        <IconAlertCircle className="text-yellow-700" />
        <span className="text-gray-500 text-sm font-normal italic">Not present in the record</span>
    </div>
    )
}