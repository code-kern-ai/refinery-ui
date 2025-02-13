import QuestionPlayground from "@/src/components/projects/projectId/playground/QuestionPlayground";
import { setCurrentPage } from "@/src/reduxStore/states/general";
import { CurrentPage } from "@/submodules/react-components/hooks/web-socket/constants";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function PlaygroundPage() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setCurrentPage(CurrentPage.QUESTION_PLAYGROUND));
    }, [])
    return (<QuestionPlayground />);
}