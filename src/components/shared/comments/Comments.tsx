import { Tooltip } from "@nextui-org/react";
import CommentsMainSection from "./CommentsMainSection";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { IconNotes } from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import { ModalEnum } from "@/src/types/shared/modal";
import { selectModal, setModalStates } from "@/src/reduxStore/states/modal";
import { useCallback } from "react";
import { selectComments } from "@/src/reduxStore/states/general";

export default function Comments() {
    const dispatch = useDispatch();
    const commentsSideBar = useSelector(selectModal(ModalEnum.COMMENTS_SECTION));
    const comments = useSelector(selectComments);

    const toggleModal = useCallback(() => {
        dispatch(setModalStates(ModalEnum.COMMENTS_SECTION, { open: !commentsSideBar.open }));
    }, [commentsSideBar]);

    return (<>
        {comments && <Tooltip content={TOOLTIPS_DICT.GENERAL.COMMENTS} color="invert" placement="left">
            <button className="cursor-pointer inline-block mr-6" onClick={toggleModal}>
                <IconNotes className="w-6 h-6" />
            </button>
        </Tooltip>}
        <CommentsMainSection open={commentsSideBar.open} toggleOpen={(toggleModal)} />
    </>)
}