import { useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { setUser } from "./states/general";
import { getUserAvatarUri, jsonCopy } from "@/submodules/javascript-functions/general";
import { setActiveProject } from "./states/project";
import { GET_PROJECT_BY_ID } from "../services/gql/queries/projects";
import { useLazyQuery } from "@apollo/client";
import { openWebsocketForConversation } from "../services/base/WebSocket";
import { GET_USER_INFO } from "../services/gql/queries/organizations";

export function GlobalStoreDataComponent(props: React.PropsWithChildren) {
    const router = useRouter();
    const dispatch = useDispatch();

    const [refetchUserInfo] = useLazyQuery(GET_USER_INFO);
    const [refetchProjectByProjectId] = useLazyQuery(GET_PROJECT_BY_ID);

    useEffect(() => {
        refetchUserInfo().then((res) => {
            const userInfo = jsonCopy(res.data["userInfo"]);
            userInfo.avatarUri = getUserAvatarUri(res.data["userInfo"]);
            dispatch(setUser(userInfo));
        });
    }, []);

    useEffect(() => {
        const projectId = router.query.projectId as string;
        if (projectId) {
            refetchProjectByProjectId({ variables: { projectId: projectId } }).then((res) => {
                dispatch(setActiveProject(res.data["projectByProjectId"]));
            });
        }
        else {
            dispatch(setActiveProject(null));
        }
        // openWebsocketForConversation(projectId, (message) => {
        //     console.log("message", message)
        // })

    }, [router.query.projectId]);

    return <>{props.children}</>;
}
