import { openModal, setModalStates } from "@/src/reduxStore/states/modal";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { GET_ALL_PERSONAL_ACCESS_TOKENS } from "@/src/services/gql/queries/project-admin";
import { PersonalAccessToken } from "@/src/types/components/projects/projectId/project-admin";
import { ModalEnum } from "@/src/types/shared/modal";
import { postProcessPersonalAccessToken } from "@/src/util/components/projects/projectId/project-admin-helper";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { useLazyQuery } from "@apollo/client"
import { Tooltip } from "@nextui-org/react";
import { IconPlus } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import NewPersonalToken from "./NewPersonalToken";

export default function ProjectAdmin() {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);

    const [accessTokens, setAccessTokens] = useState<PersonalAccessToken[]>([]);

    const [refetchAccessTokens] = useLazyQuery(GET_ALL_PERSONAL_ACCESS_TOKENS, { fetchPolicy: "network-only" });

    useEffect(() => {
        if (!projectId) return;
        refetchAccessTokens({ variables: { projectId: projectId } }).then((res) => {
            setAccessTokens(postProcessPersonalAccessToken(res.data['allPersonalAccessTokens']))
        });
    }, [projectId]);

    return (<>
        {accessTokens && <div className="p-4 bg-gray-100 h-full overflow-y-auto flex-1 flex flex-col">
            <div className="text-lg leading-6 text-gray-900 font-medium inline-block w-full">
                <label>Personal Access Tokens</label>
            </div>
            <div className="mt-1">
                <Tooltip content={TOOLTIPS_DICT.ADMIN_PAGE.NEW_ACCESS_TOKEN} color="invert" placement="right">
                    <button onClick={() => dispatch(setModalStates(ModalEnum.NEW_PERSONAL_TOKEN, { tokenNames: accessTokens, open: true }))}
                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-semibold rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer">
                        <IconPlus size={20} />
                        Add token
                    </button>
                </Tooltip>
            </div>
            <NewPersonalToken />
        </div>}
    </>)
}