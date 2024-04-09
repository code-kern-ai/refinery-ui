import { CommentData, CommentMainSectionProps, CommentPosition } from "@/src/types/shared/comments";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { useLocalStorage } from "@/submodules/react-components/hooks/useLocalStorage";
import { Tooltip } from "@nextui-org/react";
import { IconArrowLeft, IconArrowRight, IconX } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import DisplayComments from "./DisplayComments";
import { useSelector } from "react-redux";
import { selectAllUsers, selectComments } from "@/src/reduxStore/states/general";
import { UPDATE_COMMENT } from "@/src/services/gql/mutations/projects";
import { useMutation } from "@apollo/client";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { CommentCreation } from "./CommentCreation";
import { convertTypeToKey } from "@/src/util/shared/comments-helper";
import { CommentDataManager } from "@/src/util/classes/comments";
import { createComment, deleteComment as del } from "@/src/services/base/comment";

export default function CommentsMainSection(props: CommentMainSectionProps) {
    const comments = useSelector(selectComments);
    const projectId = useSelector(selectProjectId);
    const allUsers = useSelector(selectAllUsers);

    const [positionComment, setPositionComment] = useLocalStorage<CommentPosition>('positionComment', 'comments', undefined, CommentPosition.RIGHT);

    const [allOpen, setAllOpen] = useState(false);
    const [openCommentsArray, setOpenCommentsArray] = useState<boolean[]>([]);
    const [editCommentsArray, setEditCommentsArray] = useState<boolean[]>([]);
    const [commentTextsArray, setCommentTextsArray] = useState<string[]>([]);

    const [editCommentMut] = useMutation(UPDATE_COMMENT);

    useEffect(() => {
        if (!comments) return;
        prepareCommentTextArray();
        setOpenCommentsArray(Array(comments.length).fill(false));
        setEditCommentsArray(Array(comments.length).fill(false));
    }, [comments]);

    const flipCommentPosition = useCallback(() => {
        setPositionComment(positionComment == CommentPosition.RIGHT ? CommentPosition.LEFT : CommentPosition.RIGHT);
    }, [positionComment]);

    function openAllComments(value: boolean) {
        setAllOpen(value);
        setOpenCommentsArray(Array(comments.length).fill(value));
        prepareCommentTextArray();
    }

    const handleEditComment = useCallback((index: number) => {
        let editCommentsCopy = [...editCommentsArray];
        editCommentsCopy[index] = true;
        setEditCommentsArray(editCommentsCopy);
    }, [editCommentsArray]);

    function prepareCommentTextArray() {
        let commentTextsArrayNew = [];
        comments.forEach((comment: CommentData, index: number) => {
            commentTextsArrayNew[index] = comment.comment;
        });
        setCommentTextsArray(commentTextsArrayNew);
    }

    const handleCommentClick = useCallback((index: number) => {
        let openCommentsCopy = [...openCommentsArray];
        openCommentsCopy[index] = !openCommentsCopy[index];
        if (editCommentsArray[index]) {
            let editCommentsCopy = [...editCommentsArray];
            editCommentsCopy[index] = false;
            setEditCommentsArray(editCommentsCopy);
        }
        setOpenCommentsArray(openCommentsCopy);
    }, [openCommentsArray, editCommentsArray]);

    const handleCommentTextChange = useCallback((value: string, index: number) => {
        let commentTextsCopy = [...commentTextsArray];
        commentTextsCopy[index] = value;
        setCommentTextsArray(commentTextsCopy);
    }, [commentTextsArray]);


    const updateComment = useCallback((event: Event, commentId: string, toChangeKey: string, toChangeValue: any, index: number) => {
        event.stopPropagation();
        const changes = {};
        changes[toChangeKey] = toChangeValue;
        editCommentMut({ variables: { commentId: commentId, changes: JSON.stringify(changes), projectId: projectId } });
        if (toChangeKey == 'comment') {
            handleEditComment(index);
        }
    }, [projectId]);

    const deleteComment = useCallback((commentId: string) => {
        del({ commentId: commentId, projectId: projectId }, (res) => {
            setCommentTextsArray(commentTextsArray.filter((commentText: string) => commentText != commentTextsArray[commentId]));
            CommentDataManager.removeCommentFromData(commentId);
            CommentDataManager.parseToCurrentData(allUsers);
        });
    }, [commentTextsArray, projectId, allUsers]);

    const saveComment = useCallback((type: string, commentId: string, comment: string, isPrivate: boolean) => {
        createComment({ comment: comment, xftype: convertTypeToKey(type), xfkey: commentId, projectId: projectId, isPrivate: isPrivate }, (res) => {
            setCommentTextsArray([...commentTextsArray, comment]);
        });
    }, [commentTextsArray]);

    const [transformValue, setTransformValue] = useState(null);

    useEffect(() => {
        if (props.open && positionComment === CommentPosition.RIGHT) {
            setTransformValue({
                transform: 'translateX(0%)',
                transition: 'transform 500ms ease',
            });
        } else if (props.open && positionComment === CommentPosition.LEFT) {
            setTransformValue({
                transform: 'translateX(0%)',
                transition: 'transform 500ms ease',

            });
        }
        else if (!props.open && positionComment === CommentPosition.RIGHT) {
            setTransformValue({
                transform: 'translateX(100%)',
                transition: 'transform 500ms ease',
            });
        } else {
            setTransformValue({
                transform: 'translateX(-100%)',
                transition: 'transform 500ms ease',
            });
        }
    }, [props.open, positionComment]);

    return (
        <div className="relative z-30" role="dialog" aria-modal="true">
            <div className="inset-0 bg-gray-500 bg-opacity-0 opacity-0"></div>
            <div className={`absolute inset-0 overflow-hidden`}>
                {props.open && <div className={`pointer-events-auto fixed inset-y-0 flex max-w-full border-x w-96 top-16 ${positionComment == CommentPosition.RIGHT ? 'right-0' : 'left-20'}`} style={transformValue}>
                    <div className="flex h-full flex-col overflow-y-auto bg-white shadow-xl">
                        <div className="flex flex-row items-center px-4 pt-4">
                            {positionComment == CommentPosition.RIGHT ? <Tooltip content={TOOLTIPS_DICT.GENERAL.MOVE_COMMENT_LEFT} color="invert">
                                <div className='cursor-pointer' onClick={flipCommentPosition}>
                                    <IconArrowLeft size={24}
                                        strokeWidth={2}
                                        className='text-gray-700 font-bold cursor-pointer' />
                                </div>
                            </Tooltip> : <Tooltip content={TOOLTIPS_DICT.GENERAL.MOVE_COMMENT_RIGHT} color="invert">
                                <div className='cursor-pointer' onClick={flipCommentPosition}>
                                    <IconArrowRight size={24}
                                        strokeWidth={2}
                                        className='text-gray-700 font-bold cursor-pointer' />
                                </div>
                            </Tooltip>}
                            <div className="text-base flex m-auto font-bold leading-6 text-gray-900 cursor-pointer" onClick={() => openAllComments(!allOpen)}>
                                <Tooltip content={allOpen ? TOOLTIPS_DICT.GENERAL.CLOSE_ALL : TOOLTIPS_DICT.GENERAL.OPEN_ALL} contentColor="invert" hideArrow={true} placement='bottom'
                                    css={{ color: '#6B7280', border: '1px solid #6B7280', backgroundColor: '#F3F4F6', textAlign: 'center' }}>
                                    Comments
                                </Tooltip>
                            </div>
                            <button onClick={props.toggleOpen} type="button" className="rounded-md text-gray-400">
                                <span className="sr-only">Close panel</span>
                                <IconX size={24} strokeWidth={2} className='text-gray-400 cursor-pointer' />
                            </button>
                        </div>
                        <DisplayComments position={positionComment} openComments={openCommentsArray} editComments={editCommentsArray} commentTexts={commentTextsArray}
                            handleCommentClick={(index: number) => handleCommentClick(index)}
                            handleEditClick={(index: number) => handleEditComment(index)}
                            editComment={(event: Event, commentId: string, toChangeKey: string, toChangeValue: any, index: number) => updateComment(event, commentId, toChangeKey, toChangeValue, index)}
                            handleCommentTextChange={(value: string, index: number) => handleCommentTextChange(value, index)}
                            deleteComment={(id: string) => deleteComment(id)} />
                        <hr></hr>
                        <CommentCreation
                            saveComment={(type: string, commentId: string, comment: string, isPrivate: boolean) => saveComment(type, commentId, comment, isPrivate)}
                            closeCommentCreation={props.toggleOpen} isOpen={props.open} />
                    </div>
                </div>}
            </div>
        </div>
    )
}