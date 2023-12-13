import { selectBricksIntegrator, setBricksIntegrator } from "@/src/reduxStore/states/general"
import { IntegratorPage } from "@/src/types/shared/bricks-integrator";
import { useDispatch, useSelector } from "react-redux"

export default function PageInputExample() {
    const dispatch = useDispatch();

    const config = useSelector(selectBricksIntegrator);
    return (<>
        {config && <div className={`flex flex-col gap-y-2 justify-center items-center my-4 ${config.page != IntegratorPage.INPUT_EXAMPLE ? 'hidden' : ''}`}>
            <label>Input data:</label>
            <textarea
                className={`rounded-md placeholder-italic w-full max-h-28 h-16 p-2 line-height-textarea focus:outline-none border border-gray-300 text-sm`}
                onChange={(event: any) => {
                    const target = event.target as HTMLTextAreaElement;
                    const finalHeight = target.scrollHeight + 2; // +2 for border
                    const maxHeight = parseInt(window.getComputedStyle(target).getPropertyValue("max-height"));
                    target.style.height = `${finalHeight}px`;
                    target.style.overflowY = finalHeight < maxHeight ? 'hidden' : 'auto';
                    const configCopy = { ...config };
                    configCopy.example.requestData = target.value;
                    dispatch(setBricksIntegrator(configCopy));
                }}
                value={config.example.requestData}
            ></textarea>
            <div className="flex flex-row justify-between items-center w-full">
                <button type="button" onClick={() => {

                }} className="bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-md border hover:bg-indigo-800 focus:outline-none">Reset to default</button>
            </div>
        </div>}
    </>)
}