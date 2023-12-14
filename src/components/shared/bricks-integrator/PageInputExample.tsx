import { selectBricksIntegrator, setBricksIntegrator } from "@/src/reduxStore/states/general"
import { IntegratorPage, PageInputExampleProps } from "@/src/types/shared/bricks-integrator";
import { jsonCopy } from "@/submodules/javascript-functions/general";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux"
import LoadingIcon from "../loading/LoadingIcon";
import { useConsoleLog } from "@/submodules/react-components/hooks/useConsoleLog";

export default function PageInputExample(props: PageInputExampleProps) {
    const dispatch = useDispatch();

    const config = useSelector(selectBricksIntegrator);

    const [inputData, setInputData] = useState('');

    useEffect(() => {
        if (!config.example.requestData) return;
        setInputData(config.example.requestData);
    }, [config.example.requestData]);

    return (<>
        {config && <div className={`flex flex-col gap-y-2 justify-center items-center my-4 ${config.page != IntegratorPage.INPUT_EXAMPLE ? 'hidden' : ''}`}>
            <label>Input data:</label>
            <textarea value={inputData}
                className={`rounded-md placeholder-italic w-full max-h-28 h-16 p-2 line-height-textarea focus:outline-none border border-gray-300 text-sm`}
                onChange={(event: any) => {
                    const target = event.target as HTMLTextAreaElement;
                    const finalHeight = target.scrollHeight + 2; // +2 for border
                    const maxHeight = parseInt(window.getComputedStyle(target).getPropertyValue("max-height"));
                    target.style.height = `${finalHeight}px`;
                    target.style.overflowY = finalHeight < maxHeight ? 'hidden' : 'auto';
                    const configCopy = jsonCopy(config);
                    configCopy.example.requestData = target.value;
                    setInputData(target.value);
                    dispatch(setBricksIntegrator(configCopy));
                }}
            >{inputData}</textarea>
            <div className="flex flex-row justify-between items-center w-full">
                <button type="button" onClick={() => {
                    setInputData(config.api.data.data.attributes.inputExample);
                    const configCopy = jsonCopy(config);
                    configCopy.example.returnData = null;
                    dispatch(setBricksIntegrator(configCopy));
                }} className="bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-md border hover:bg-indigo-800 focus:outline-none">Reset to default</button>
                <button type="button" onClick={props.requestExample} className="bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-md border hover:bg-indigo-800 focus:outline-none">Request example</button>
            </div>
            {config.example.requesting ? (<LoadingIcon />) : (<>
                {config.example.returnData && <textarea disabled={true} value={config.example.returnData} onChange={() => { }}
                    className="textarea placeholder-italic w-full p-2 line-height-textarea focus:outline-none border border-gray-300 bg-gray-200"
                >{config.example.returnData}</textarea>}
            </>)}
        </div>}
    </>)
}