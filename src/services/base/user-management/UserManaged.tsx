import { memo, useEffect, useState } from "react";
import { getIsDemo, getIsManaged } from "./data-fetch";
import { useDispatch, useSelector } from "react-redux";
import { selectIsDemo, selectIsManaged, setIsDemo, setIsManaged } from "@/src/reduxStore/states/general";

function GetUserManagerWrapper(props: React.PropsWithChildren) {
    const dispatch = useDispatch();
    const isManaged = useSelector(selectIsManaged);
    const isDemo = useSelector(selectIsDemo);
    const [dataLoaded, setDataLoaded] = useState(false);

    useEffect(() => {
        getIsManaged((data) => {
            dispatch(setIsManaged(data));
        });
        getIsDemo((data) => {
            dispatch(setIsDemo(data));
        });
    }, []);

    useEffect(() => {
        if (isManaged == null || isDemo == null) return;
        setDataLoaded(true);
    }, [isManaged, isDemo]);
    if (!dataLoaded) return null;
    return <div>{props.children}</div>;
}

export const UserManagerWrapper = memo(GetUserManagerWrapper);