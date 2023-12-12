import { selectProjectId } from "@/src/reduxStore/states/project";
import { CommentCreationProps, CommentType } from "@/src/types/shared/comments";
import { CommentDataManager } from "@/src/util/classes/comments";
import { convertTypeToKey } from "@/src/util/shared/comments-helper";
import Dropdown from "@/submodules/react-components/components/Dropdown";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

export function CommentCreation(props: CommentCreationProps) {
    const projectId = useSelector(selectProjectId);

    const [type, setType] = useState(null);
    const [commentInstance, setCommentInstance] = useState(null);
    const [commentId, setCommentId] = useState(null);
    const [isPrivateComment, setIsPrivateComment] = useState(false);
    const [commentIdOptions, setCommentIdOptions] = useState([]);
    const [newComment, setNewComment] = useState('');

    const textareaRef = useRef(null);

    useEffect(() => {
        if (!CommentDataManager.currentCommentTypeOptions) return;
        setType(CommentDataManager.currentCommentTypeOptions[0].name);
    }, [CommentDataManager.currentCommentTypeOptions]);

    useEffect(() => {
        if (props.isOpen) {
            const textarea = textareaRef.current;
            if (textarea) textarea.focus();
        }
    }, [props.isOpen]);

    useEffect(() => {
        if (!type) return;
        setCommentIdOptions(CommentDataManager.getCommentKeyOptions(convertTypeToKey(type), projectId));
        if (type == CommentType.RECORD) {
            setNewCommentsToLastElement();
        }
    }, [type]);

    function checkIfKeyShiftEnterSave(event: KeyboardEvent) {
        let commentValue = (event.target as HTMLInputElement).value;
        if (commentValue != '' && event.shiftKey && event.key === "Enter") {
            event.preventDefault();
            commentValue = commentValue.trim();
            if (commentValue.length > 0) {
                props.saveComment(type, commentId, newComment, isPrivateComment);
                setType(CommentDataManager.currentCommentTypeOptions[0].name);
                setCommentInstance(null);
                setCommentId(null);
                setIsPrivateComment(false);
                setNewComment('');
            }
        }
    }

    const saveComment = useCallback(() => {
        props.saveComment(type, commentId, newComment, isPrivateComment);
        setType(CommentDataManager.currentCommentTypeOptions[0].name);
        setCommentInstance(null);
        setCommentId(null);
        setIsPrivateComment(false);
        setNewComment('');
    }, [props.saveComment, type, commentId, newComment, isPrivateComment]);

    function setNewCommentsToLastElement() {
        const lastElement = CommentDataManager.getLastRecordInfo();
        if (!lastElement) return;
        setCommentInstance(lastElement.name);
        setCommentId(lastElement.id);
    }

    return (
        <div>
            <div className="mt-3 grid gap-x-4 gap-y-2 items-center text-sm font-medium text-gray-700 px-4"
                style={{ gridTemplateColumns: '40% 56%' }}>
                <div className="font-normal">Type</div>
                <div className="font-normal">Instance</div>
                <Dropdown options={CommentDataManager.currentCommentTypeOptions ?? []} buttonName={type ?? 'Select Type'} selectedOption={(option: string) => {
                    setType(option);
                    setCommentInstance(null);
                    setCommentId(null);
                }} />
                <Dropdown options={commentIdOptions} buttonName={commentInstance ?? 'Select Instance'} selectedOption={(option: string) => {
                    setCommentInstance(option)
                    setCommentId(commentIdOptions.find((opt: any) => opt.name == option).id);
                }} />
            </div>
            <div className="mt-3 px-4">
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Comment</label>
                <div className="mt-1">
                    <textarea ref={textareaRef} placeholder="Enter new comment..."
                        className={`placeholder-italic w-full h-20 p-2 line-height-textarea border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100`}
                        onChange={(event: any) => {
                            let text = (event.target as HTMLTextAreaElement).value;
                            if (text.trim().length == 0) text = '';
                            setNewComment(text);
                        }}
                        value={newComment}
                        onKeyDown={(event: any) => checkIfKeyShiftEnterSave(event)}
                    ></textarea>
                </div>
                <div className="my-1 text-xs text-gray-500 font-normal text-justify">
                    The comment will be stored on project-level, so that your team members can look into it. Use this e.g. to help annotators better understand context of labels or labeling tasks.
                </div>
                <div className="flex flex-row items-start mt-2 text-left">
                    <input type="checkbox" checked={isPrivateComment} onChange={(e) => setIsPrivateComment(e.target.checked)} name="privateComment" id="privateComment"
                        className="h-6 w-4 border-gray-200 cursor-pointer" />
                    <label htmlFor="privateComment" className="ml-1 block text-sm font-medium text-gray-700 cursor-pointer">
                        <span>Private comment</span>
                        <p className="text-gray-500 text-sm cursor-pointer">If ticked, this will not be shown to any other member in your team. </p>
                    </label>
                </div>
            </div>

            <div className="flex p-4">
                <button type="button"
                    disabled={newComment == '' || !type || !commentInstance || !commentId}
                    onClick={saveComment}
                    className={`flex-1 bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-md border hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed`}>
                    Create comment
                </button>
                <button onClick={props.closeCommentCreation}
                    type="button"
                    className="flex-1 ml-3 bg-white text-gray-700 text-xs font-semibold px-4 py-2 rounded border border-gray-300 cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 inline-block">Close</button>
            </div>
        </div >
    )
}