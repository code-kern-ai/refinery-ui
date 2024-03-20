import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { selectIsAdmin, selectIsDemo, selectIsManaged, selectOrganization, setAllUsers, setIsAdmin, setIsDemo, setIsManaged, setOrganization, setRouteColor, setUser } from "./states/general";
import { getUserAvatarUri } from "@/submodules/javascript-functions/general";
import { setActiveProject } from "./states/project";
import { useLazyQuery } from "@apollo/client";
import { GET_ORGANIZATION_USERS } from "../services/gql/queries/organizations";
import { GET_VERSION_OVERVIEW } from "../services/gql/queries/config";
import { getIsDemo, getIsManaged } from "../services/base/data-fetch";
import { WebSocketsService } from "../services/base/web-sockets/WebSocketsService";
import { timer } from "rxjs";
import { RouteManager } from "../services/base/route-manager";
import { CacheEnum, setCache } from "./states/cachedValues";
import { postProcessingZeroShotEncoders } from "../util/components/models-downloaded/models-downloaded-helper";
import { checkWhitelistTokenizer } from "../util/components/projects/new-project/new-project-helper";
import { ConfigManager } from "../services/base/config";
import postprocessVersionOverview from "../util/shared/sidebar-helper";
import { postProcessingEmbeddingPlatforms } from "../util/components/projects/projectId/settings/embeddings-helper";
import { setDisplayUserRole } from "./states/pages/labeling";
import { getProjectByProjectId } from "../services/base/project";
import { getIsAdmin } from "../services/base/misc";
import { getUserInfo, getOrganization } from "../services/base/organization";
import { getZeroShotRecommendations } from "../services/base/zero-shot";
import { getAllTokenizerOptions, getEmbeddingPlatforms, getRecommendedEncoders } from "../services/base/embedding";

export function GlobalStoreDataComponent(props: React.PropsWithChildren) {
    const router = useRouter();
    const dispatch = useDispatch();

    const isManaged = useSelector(selectIsManaged);
    const isDemo = useSelector(selectIsDemo);
    const isAdmin = useSelector(selectIsAdmin);
    const organization = useSelector(selectOrganization);

    const [dataLoaded, setDataLoaded] = useState(false);

    // const [refetchUserInfo] = useLazyQuery(GET_USER_INFO, { fetchPolicy: 'no-cache' });
    const [refetchOrganizationUsers] = useLazyQuery(GET_ORGANIZATION_USERS, { fetchPolicy: 'no-cache' });
    const [refetchVersionOverview] = useLazyQuery(GET_VERSION_OVERVIEW, { fetchPolicy: 'no-cache' });

    useEffect(() => {
        getIsManaged((data) => {
            dispatch(setIsManaged(data));
        });

        getIsDemo((data) => {
            dispatch(setIsDemo(data));
        });

        getIsAdmin((data) => {
            dispatch(setIsAdmin(data.data.isAdmin));
        });

        getUserInfo((res) => {
            const userInfo = { ...res.data["userInfo"] };
            userInfo.avatarUri = getUserAvatarUri(res.data["userInfo"]);
            dispatch(setUser(userInfo));
            dispatch(setDisplayUserRole(res.data["userInfo"].role));
        });

        getOrganization((res) => {
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
        });

        // Set cache
        refetchVersionOverview().then((res) => {
            dispatch(setCache(CacheEnum.VERSION_OVERVIEW, postprocessVersionOverview(res.data['versionOverview'])));
        });
        getEmbeddingPlatforms((res) => {
            dispatch(setCache(CacheEnum.EMBEDDING_PLATFORMS, postProcessingEmbeddingPlatforms(res.data['embeddingPlatforms'], organization)))
        });
    }, []);

    useEffect(() => {
        if (!organization) return;
        refetchOrganizationUsers().then((res) => {
            dispatch(setAllUsers(res.data["allUsers"]));
        });
    }, [organization]);

    useEffect(() => {
        const routeColor = RouteManager.checkRouteHighlight(router.asPath);
        dispatch(setRouteColor(routeColor));
        const something = (url: any) => {
            const routeColor = RouteManager.checkRouteHighlight(url);
            dispatch(setRouteColor(routeColor));
        }
        router.events.on('routeChangeComplete', something)
        return () => {
            router.events.off('routeChangeComplete', something)
        }
    }, []);

    useEffect(() => {
        if (isManaged == null || isDemo == null || isAdmin == null) return;
        setDataLoaded(true);
    }, [isManaged, isDemo, isAdmin]);

    useEffect(() => {
        const projectId = router.query.projectId as string;
        if (projectId) {
            getProjectByProjectId(projectId, (res) => {
                dispatch(setActiveProject(res.data["projectByProjectId"]));
            })
            getZeroShotRecommendations(projectId, (res) => {
                dispatch(setCache(CacheEnum.ZERO_SHOT_RECOMMENDATIONS, res.data['zeroShotRecommendations']))
                getRecommendedEncoders(null, (resEncoders) => {
                    dispatch(setCache(CacheEnum.MODELS_LIST, postProcessingZeroShotEncoders(res.data['zeroShotRecommendations'], resEncoders.data['recommendedEncoders'])))
                });
            });
        }
        else {
            dispatch(setActiveProject(null));
        }

    }, [router.query.projectId]);

    useEffect(() => {
        if (!ConfigManager.isInit()) return;
        getAllTokenizerOptions((res) => {
            dispatch(setCache(CacheEnum.TOKENIZER_VALUES, checkWhitelistTokenizer(res.data['languageModels'], isManaged)));
        })
    }, [ConfigManager.isInit(), isManaged]);

    if (!dataLoaded) return <></>;
    return <div>{props.children}</div>;
}
