import { memo, useEffect, useState } from "react";
import { getIsDemo, getIsManaged } from "./data-fetch";
import { useDispatch, useSelector } from "react-redux";
import { selectIsAdmin, selectIsDemo, selectIsManaged, setIsAdmin, setIsDemo, setIsManaged } from "@/src/reduxStore/states/general";
import { useLazyQuery } from "@apollo/client";
import { GET_IS_ADMIN } from "../../gql/queries/config";

function GetUserManagerWrapper(props: React.PropsWithChildren) {
    const dispatch = useDispatch();
    const isManaged = useSelector(selectIsManaged);
    const isDemo = useSelector(selectIsDemo);
    const isAdmin = useSelector(selectIsAdmin);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [getIsAdmin] = useLazyQuery(GET_IS_ADMIN, { fetchPolicy: "no-cache" });

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
    }, []);

    useEffect(() => {
        if (isManaged == null || isDemo == null || isAdmin == null) return;
        setDataLoaded(true);
    }, [isManaged, isDemo, isAdmin]);
    if (!dataLoaded) return null;
    return <div>{props.children}</div>;
}

export const UserManagerWrapper = memo(GetUserManagerWrapper);