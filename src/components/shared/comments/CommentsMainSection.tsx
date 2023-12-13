import { CommentData, CommentMainSectionProps, CommentPosition } from "@/src/types/shared/comments";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { useLocalStorage } from "@/submodules/react-components/hooks/useLocalStorage";
import { Dialog, Transition } from "@headlessui/react";
import { Tooltip } from "@nextui-org/react";
import { IconArrowLeft, IconArrowRight, IconX } from "@tabler/icons-react";
import { Fragment, useCallback, useEffect, useState } from "react";
import DisplayComments from "./DisplayComments";
import { useSelector } from "react-redux";
import { selectAllUsers, selectComments } from "@/src/reduxStore/states/general";
import { CREATE_COMMENT, DELETE_COMMENT, UPDATE_COMMENT } from "@/src/services/gql/mutations/projects";
import { useMutation } from "@apollo/client";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { CommentCreation } from "./CommentCreation";
import { convertTypeToKey } from "@/src/util/shared/comments-helper";
import { CommentDataManager } from "@/src/util/classes/comments";

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
    const [deleteCommentMut] = useMutation(DELETE_COMMENT);
    const [createCommentMut] = useMutation(CREATE_COMMENT)

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
        deleteCommentMut({ variables: { commentId: commentId, projectId: projectId } }).then((res) => {
            setCommentTextsArray(commentTextsArray.filter((commentText: string) => commentText != commentTextsArray[commentId]));
            CommentDataManager.removeCommentFromData(commentId);
            CommentDataManager.parseToCurrentData(allUsers);
        });
    }, [commentTextsArray, projectId, allUsers]);

    const saveComment = useCallback((type: string, commentId: string, comment: string, isPrivate: boolean) => {
        createCommentMut({ variables: { projectId: projectId, comment: comment, xftype: convertTypeToKey(type), xfkey: commentId, isPrivate: isPrivate } }).then(() => {
            setCommentTextsArray([...commentTextsArray, comment]);
        });
    }, [commentTextsArray]);

    return (
        <Transition.Root show={props.open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={props.toggleOpen}>
                <div className="fixed inset-0" />

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className={`pointer-events-none fixed inset-y-0 flex max-w-full top-16 ${positionComment == CommentPosition.RIGHT ? 'right-0' : 'left-20'}`}>
                            <Transition.Child
                                as={Fragment}
                                enter="transform transition ease-in-out duration-500 sm:duration-700"
                                enterFrom={positionComment == CommentPosition.RIGHT ? 'translate-x-full' : '-translate-x-full'}
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-500 sm:duration-700"
                                leaveFrom="translate-x-0"
                                leaveTo={positionComment == CommentPosition.RIGHT ? 'translate-x-full' : '-translate-x-full'}
                            >
                                <Dialog.Panel className="pointer-events-auto w-screen max-w-md border border-gray-300">
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
                                            <Dialog.Title className="text-base flex m-auto font-bold leading-6 text-gray-900 cursor-pointer" onClick={() => openAllComments(!allOpen)}>
                                                <Tooltip content={allOpen ? TOOLTIPS_DICT.GENERAL.CLOSE_ALL : TOOLTIPS_DICT.GENERAL.OPEN_ALL} contentColor="invert" hideArrow={true} placement='bottom'
                                                    css={{ color: '#6B7280', border: '1px solid #6B7280', backgroundColor: '#F3F4F6', textAlign: 'center' }}>
                                                    Comments
                                                </Tooltip>
                                            </Dialog.Title>
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
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition.Root >
    )
}