import { openModal, setModalStates } from "@/src/reduxStore/states/modal";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { PersonalAccessToken } from "@/src/types/components/projects/projectId/project-admin";
import { ModalEnum } from "@/src/types/shared/modal";
import { postProcessPersonalAccessToken } from "@/src/util/components/projects/projectId/project-admin-helper";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { Tooltip } from "@nextui-org/react";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import NewPersonalToken from "./NewPersonalTokenModal";
import DeletePersonalToken from "./DeletePersonalTokenModal";
import { CurrentPage } from "@/src/types/shared/general";
import { useRouter } from "next/router";
import { selectIsAdmin } from "@/src/reduxStore/states/general";
import { useWebsocket } from "@/src/services/base/web-sockets/useWebsocket";
import { getAccessTokens } from "@/src/services/base/project";

export default function ProjectAdmin() {
    const router = useRouter();
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const isAdmin = useSelector(selectIsAdmin);

    const [accessTokens, setAccessTokens] = useState<PersonalAccessToken[]>([]);

    useEffect(() => {
        if (!projectId) return;
        refetchAccessTokensAndProcess();

        if (!isAdmin) {
            console.log("you should not be here");
            router.push(`/projects`);
            return;
        }

    }, [projectId]);

    function refetchAccessTokensAndProcess() {
        getAccessTokens(projectId, (res) => {
            setAccessTokens(postProcessPersonalAccessToken(res.data['allPersonalAccessTokens']));
        });
    }

    const handleWebsocketNotification = useCallback((msgParts: string[]) => {
        if (msgParts[1] == 'pat') {
            if (!accessTokens) return; // to ensure the program doesn't crash if the data wasn't loaded yet but the websocket already tells us to refetch
            const id = msgParts[2];
            if (accessTokens.find(p => p.id == id)) {
                refetchAccessTokensAndProcess();
            }
        }
    }, [accessTokens]);

    useWebsocket(CurrentPage.ADMIN_PAGE, handleWebsocketNotification, projectId);

    return (<>
        {accessTokens && <div className="p-4 bg-gray-100 h-full overflow-y-auto flex-1 flex flex-col">
            <div className="text-lg leading-6 text-gray-900 font-medium inline-block w-full">
                <label>Personal Access Tokens</label>
            </div>
            <div className="mt-1">
                <div className="text-sm leading-5 font-medium text-gray-700 inline-block">Manage project-based personal access tokens used to interact with Refinery’s commercial proxy.</div>
                <div className="mt-2 inline-block min-w-full align-middle">
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col"
                                        className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Name</th>
                                    <th scope="col"
                                        className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Scope</th>
                                    <th scope="col"
                                        className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Created by</th>
                                    <th scope="col"
                                        className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Created at</th>
                                    <th scope="col"
                                        className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Expires at</th>
                                    <th scope="col"
                                        className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Last used</th>
                                    <th scope="col"
                                        className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {accessTokens.map((token: PersonalAccessToken, index: number) => (<tr key={token.id} className={`${index % 2 != 0 ? 'bg-gray-50' : 'bg-white'}`}>
                                    <td className="whitespace-nowrap text-center px-3 py-2 text-sm text-gray-500">{token.name}</td>
                                    <td className="whitespace-nowrap text-center px-3 py-2 text-sm text-gray-500">{token.scope}</td>
                                    <td className="whitespace-nowrap text-center px-3 py-2 text-sm text-gray-500">{token.createdBy}</td>
                                    <td className="whitespace-nowrap text-center px-3 py-2 text-sm text-gray-500">{token.createdAt}</td>
                                    <td className="whitespace-nowrap text-center px-3 py-2 text-sm text-gray-500">{token.expiresAt}</td>
                                    <td className="whitespace-nowrap text-center px-3 py-2 text-sm text-gray-500">{token.lastUsed}</td>
                                    <td className="whitespace-nowrap text-center px-3 py-2 text-sm text-gray-500">
                                        <IconTrash onClick={() => dispatch(setModalStates(ModalEnum.DELETE_PERSONAL_TOKEN, { tokenId: token.id, open: true }))}
                                            className="h-6 w-6 text-red-700 cursor-pointer" />
                                    </td>
                                </tr>))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className="mt-1">
                <Tooltip content={TOOLTIPS_DICT.ADMIN_PAGE.NEW_ACCESS_TOKEN} color="invert" placement="right">
                    <button onClick={() => dispatch(openModal(ModalEnum.NEW_PERSONAL_TOKEN))}
                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-semibold rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer">
                        <IconPlus className="mr-1" size={20} />
                        Add token
                    </button>
                </Tooltip>
            </div>
            <NewPersonalToken refetchTokens={refetchAccessTokensAndProcess} accessTokens={accessTokens} />
            <DeletePersonalToken refetchTokens={refetchAccessTokensAndProcess} />
        </div>}
    </>)
}