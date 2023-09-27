import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { selectIsAdmin, selectIsDemo, selectIsManaged, setIsAdmin, setIsDemo, setIsManaged, setOrganization, setUser } from "./states/general";
import { getUserAvatarUri, jsonCopy } from "@/submodules/javascript-functions/general";
import { setActiveProject } from "./states/project";
import { GET_PROJECT_BY_ID } from "../services/gql/queries/projects";
import { useLazyQuery } from "@apollo/client";
import { GET_ORGANIZATION, GET_USER_INFO } from "../services/gql/queries/organizations";
import { GET_IS_ADMIN } from "../services/gql/queries/config";
import { getIsDemo, getIsManaged } from "../services/base/user-management/data-fetch";
import { WebSocketsService } from "../services/base/web-sockets/WebSocketsService";
import { timer } from "rxjs";

export function GlobalStoreDataComponent(props: React.PropsWithChildren) {
    const router = useRouter();
    const dispatch = useDispatch();

    const isManaged = useSelector(selectIsManaged);
    const isDemo = useSelector(selectIsDemo);
    const isAdmin = useSelector(selectIsAdmin);

    const [dataLoaded, setDataLoaded] = useState(false);

    const [getIsAdmin] = useLazyQuery(GET_IS_ADMIN, { fetchPolicy: "no-cache" });
    const [refetchUserInfo] = useLazyQuery(GET_USER_INFO);
    const [refetchProjectByProjectId] = useLazyQuery(GET_PROJECT_BY_ID);
    const [refetchOrganization] = useLazyQuery(GET_ORGANIZATION);

    useEffect(() => {
        getIsManaged((data) => {
            dispatch(setIsManaged(data));
        });
        getIsDemo((data) => {
            dispatch(setIsDemo(data));
        });
        getIsAdmin().then((data) => {
            dispatch(setIsAdmin(data.data.isAdmin));
        });
        refetchUserInfo().then((res) => {
            const userInfo = jsonCopy(res.data["userInfo"]);
            userInfo.avatarUri = getUserAvatarUri(res.data["userInfo"]);
            dispatch(setUser(userInfo));
        });
        refetchOrganization().then((res) => {
            if (res.data["userOrganization"]) {
                if (WebSocketsService.getConnectionOpened()) return;
                WebSocketsService.setConnectionOpened(true);
                WebSocketsService.initWsNotifications();
                setDataLoaded(true);
                dispatch(setOrganization(res.data["userOrganization"]));
            } else {
                dispatch(setOrganization(null));
                timer(60000).subscribe(() => location.reload())
            }
        })
    }, []);

    useEffect(() => {
        if (isManaged == null || isDemo == null || isAdmin == null) return;
        setDataLoaded(true);
    }, [isManaged, isDemo, isAdmin]);

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

    }, [router.query.projectId]);

    return <div>{props.children}</div>;
}
