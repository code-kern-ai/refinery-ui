import { selectComments } from '@/src/reduxStore/states/general'
import { selectProjectId } from '@/src/reduxStore/states/project'
import { CommentCreationProps, CommentType } from '@/src/types/shared/comments'
import { CommentDataManager } from '@/src/util/classes/comments'
import { convertTypeToKey } from '@/src/util/shared/comments-helper'
import Dropdown2 from '@/submodules/react-components/components/Dropdown2'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

export function CommentCreation(props: CommentCreationProps) {
  const projectId = useSelector(selectProjectId)
  const comments = useSelector(selectComments)

  const [type, setType] = useState(null)
  const [commentInstance, setCommentInstance] = useState(null)
  const [commentId, setCommentId] = useState(null)
  const [isPrivateComment, setIsPrivateComment] = useState(false)
  const [commentIdOptions, setCommentIdOptions] = useState([])
  const [newComment, setNewComment] = useState('')

  const textareaRef = useRef(null)

  useEffect(() => {
    if (!CommentDataManager.currentCommentTypeOptions) return
    setType(CommentDataManager.currentCommentTypeOptions[0])
  }, [CommentDataManager.currentCommentTypeOptions])

  useEffect(() => {
    if (props.isOpen) {
      const textarea = textareaRef.current
      if (textarea) textarea.focus()
    }
  }, [props.isOpen])

  useEffect(() => {
    if (!type || !projectId || !comments) return
    setCommentIdOptions(
      CommentDataManager.getCommentKeyOptions(
        convertTypeToKey(type.name),
        projectId,
      ),
    )
    if (type.name == CommentType.RECORD) {
      setNewCommentsToLastElement()
    }
  }, [type, projectId, comments])

  function checkIfKeyShiftEnterSave(event: KeyboardEvent) {
    let commentValue = (event.target as HTMLInputElement).value
    if (commentValue != '' && event.shiftKey && event.key === 'Enter') {
      event.preventDefault()
      commentValue = commentValue.trim()
      if (commentValue.length > 0) {
        props.saveComment(type.name, commentId, newComment, isPrivateComment)
        setType(CommentDataManager.currentCommentTypeOptions[0])
        setCommentInstance(null)
        setCommentId(null)
        setIsPrivateComment(false)
        setNewComment('')
      }
    }
  }

  const saveComment = useCallback(() => {
    props.saveComment(type.name, commentId, newComment, isPrivateComment)
    setType(CommentDataManager.currentCommentTypeOptions[0])
    setCommentInstance(null)
    setCommentId(null)
    setIsPrivateComment(false)
    setNewComment('')
  }, [props.saveComment, type, commentId, newComment, isPrivateComment])

  function setNewCommentsToLastElement() {
    const lastElement = CommentDataManager.getLastRecordInfo()
    if (!lastElement) return
    setCommentInstance(lastElement)
    setCommentId(lastElement.id)
  }

  return (
    <div>
      <div
        className="mt-3 grid items-center gap-x-4 gap-y-2 px-4 text-sm font-medium text-gray-700"
        style={{ gridTemplateColumns: '40% 56%' }}
      >
        <div className="font-normal">Type</div>
        <div className="font-normal">Instance</div>
        <Dropdown2
          options={CommentDataManager.currentCommentTypeOptions ?? []}
          buttonName={type ? type.name : 'Select Type'}
          selectedOption={(option: any) => {
            setType(option)
            setCommentInstance(null)
            setCommentId(null)
          }}
        />
        <Dropdown2
          options={commentIdOptions}
          buttonName={
            commentInstance ? commentInstance.name : 'Select Instance'
          }
          selectedOption={(option: any) => {
            setCommentInstance(option)
            setCommentId(option.id)
          }}
        />
      </div>
      <div className="mt-3 px-4">
        <label
          htmlFor="comment"
          className="block text-sm font-medium text-gray-700"
        >
          Comment
        </label>
        <div className="mt-1">
          <textarea
            ref={textareaRef}
            placeholder="Enter new comment..."
            className={`placeholder-italic line-height-textarea h-20 w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100`}
            onChange={(event: any) => {
              let text = (event.target as HTMLTextAreaElement).value
              if (text.trim().length == 0) text = ''
              setNewComment(text)
            }}
            value={newComment}
            onKeyDown={(event: any) => checkIfKeyShiftEnterSave(event)}
            onKeyUp={(event: any) => event.stopPropagation()}
          ></textarea>
        </div>
        <div className="my-1 text-justify text-xs font-normal text-gray-500">
          The comment will be stored on project-level, so that your team members
          can look into it. Use this e.g. to help annotators better understand
          context of labels or labeling tasks.
        </div>
        <div className="mt-2 flex flex-row items-start text-left">
          <input
            type="checkbox"
            checked={isPrivateComment}
            onChange={(e) => setIsPrivateComment(e.target.checked)}
            name="privateComment"
            id="privateComment"
            className="h-6 w-4 cursor-pointer border-gray-200"
          />
          <label
            htmlFor="privateComment"
            className="ml-1 block cursor-pointer text-sm font-medium text-gray-700"
          >
            <span>Private comment</span>
            <p className="cursor-pointer text-sm text-gray-500">
              If ticked, this will not be shown to any other member in your
              team.{' '}
            </p>
          </label>
        </div>
      </div>

      <div className="flex p-4">
        <button
          type="button"
          disabled={newComment == '' || !type || !commentInstance || !commentId}
          onClick={saveComment}
          className={`flex-1 rounded-md border bg-indigo-700 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
        >
          Create comment
        </button>
        <button
          onClick={props.closeCommentCreation}
          type="button"
          className="ml-3 inline-block flex-1 cursor-pointer rounded border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Close
        </button>
      </div>
    </div>
  )
}
