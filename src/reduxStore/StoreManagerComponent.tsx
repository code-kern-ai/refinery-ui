import { use, useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { selectUser, setUser } from "./states/user";
import { getUserInfo } from "../services/gql/services/organizations.service";
import { get } from "http";
import { useQuery } from "@apollo/client";
import { getUserAvatarUri, jsonCopy } from "@/submodules/javascript-functions/general";
import { selectProject, selectProjectId, setActiveProject } from "./states/project";
import { getProjectByProjectId } from "../services/gql/services/projects.service";
import { GET_PROJECT_BY_ID } from "../services/gql/queries/projects";

export function GlobalStoreDataComponent(props: React.PropsWithChildren) {
    const router = useRouter();
    const dispatch = useDispatch();
    const { data: user } = getUserInfo();
    const { data: project } = getProjectByProjectId(router.query.projectId as string);

    useEffect(() => {
        if (!router.query.projectId) return;
        if (!project) return;
        const projectId = router.query.projectId as string;
        if (!projectId) {
            dispatch(setActiveProject(null));
            return;
        }
        dispatch(setActiveProject(project["projectByProjectId"]));
    }, [router.query.projectId, project]);

    useEffect(() => {
        if (!user) return;
        const userInfo = jsonCopy(user["userInfo"]);
        userInfo.avatarUri = getUserAvatarUri(user);
        dispatch(setUser(userInfo));
    }, [user]);

    if (!user) return null;
    return <>{props.children}</>;
}
