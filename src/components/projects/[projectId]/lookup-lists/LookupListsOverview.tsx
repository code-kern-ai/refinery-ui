import { selectProject } from "@/src/reduxStore/states/project";
import { getLookupListsByProjectId } from "@/src/services/gql/services/lookup-lists.service"
import { useRouter } from "next/router"
import { use, useEffect } from "react"
import { useSelector } from "react-redux";

export default function LookupListsOverview() {
    const router = useRouter();
    const project = useSelector(selectProject);

    let [getLookupLists, { data: lookupLists }] = getLookupListsByProjectId(project.id);

    useEffect(() => {
        getLookupLists();
    }, []);

    useEffect(() => {
        if (!lookupLists) return;
        console.log(lookupLists);
    }, [lookupLists]);

    return (
        project.id ? (
            <div className="p-4 h-full bg-gray-100 flex-1 flex flex-col">
                <div className="w-full ">
                    <div className="flex-shrink-0 block sm:flex justify-between items-center">
                        <div className="text-lg leading-6 text-gray-900 font-medium inline-block">
                            Lookup lists
                        </div>
                        <div className="grid grid-cols-1 gap-4 xs:flex xs:gap-0 flex-row flex-nowrap items-center">

                        </div>
                    </div>
                    {lookupLists?.length == 0 ? (
                        <div>
                            <div className="text-gray-500 font-normal mt-8">
                                <p className="text-xl leading-7">Seems like your project has no lookup list yet.</p>
                                <p className="text-base mt-3 leading-6">You can create one from the button New list in the bar above.
                                    Also, we got some quicklinks from our <a href="https://docs.kern.ai/" target="_blank"><span
                                        className="underline cursor-pointer">documentation</span></a>, if you want to dive deeper.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-8">
                                <div>
                                    <div className="text-gray-900 text-xl leading-7 font-semibold">Automatically building lookup lists
                                    </div>
                                    <div className="text-gray-500 text-base leading-6 font-normal mt-3">When you label for an extraction
                                        task, we automatically generate a lookup list with that label name. Also, each labeled span
                                        is going to be stored in that list. That way, you can just label your data, and we collect
                                        your entities.</div>
                                    <div
                                        className="text-green-800 hover:text-green-500 text-base leading-6 font-semibold mt-3 cursor-pointer">
                                        <a href="https://docs.kern.ai/docs/building-labeling-functions#lookup-lists-for-distant-supervision"
                                            target="_blank">Read about lookup lists</a>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-gray-900 text-xl leading-7 font-semibold">Building labeling functions using
                                        lookup lists</div>
                                    <div className="text-gray-500 text-base leading-6 font-normal mt-3">Labeling functions can be
                                        implemented to look up these lists, such that you don't need to maintain the function code,
                                        but can instead cover the lookup list. There are plenty other template functions, which you
                                        can check out in our public GitHub repository.</div>
                                    <div
                                        className="text-green-800 hover:text-green-500 text-base leading-6 font-semibold mt-3 cursor-pointer">
                                        <a href="https://github.com/code-kern-ai/template-functions" target="_blank">Read about
                                            template functions</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (<></>)}
                </div>
            </div>
        ) : (<></>)
    )
}