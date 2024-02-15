import { selectComments, selectUser } from '@/src/reduxStore/states/general'
import {
  CommentData,
  CommentPosition,
  DisplayCommentsProps,
} from '@/src/types/shared/comments'
import { combineClassNames } from '@/submodules/javascript-functions/general'
import { Menu, Transition } from '@headlessui/react'
import { Tooltip } from '@nextui-org/react'
import {
  IconDotsVertical,
  IconEdit,
  IconEye,
  IconEyeOff,
  IconTrash,
} from '@tabler/icons-react'
import { Fragment } from 'react'
import { useSelector } from 'react-redux'

export default function DisplayComments(props: DisplayCommentsProps) {
  const comments = useSelector(selectComments)
  const positionComment = localStorage.getItem(
    'commentPosition',
  ) as CommentPosition
  const user = useSelector(selectUser)

  function checkIfKeyShiftEnterUpdate(
    event: KeyboardEvent,
    commentId: string,
    commentText: string,
    index: number,
  ) {
    if (event.shiftKey && event.key === 'Enter') {
      event.preventDefault()
      props.editComment(event, commentId, 'comment', commentText, index)
    }
  }

  return (
    <div className="overflow-auto p-4" style={{ height: 'calc(50vh - 50px)' }}>
      {comments && comments.length > 0 ? (
        <ul role="list" className="h-full flex-1 overflow-y-auto">
          {comments.map((comment: CommentData, index: number) => (
            <div className="mr-1" key={comment.id}>
              <li>
                <div className="group relative flex items-center py-4">
                  <a
                    className="block w-full flex-1 cursor-pointer p-1 pr-8"
                    onClick={() => {
                      props.handleCommentClick(index)
                    }}
                  >
                    <div
                      className="absolute inset-0 group-hover:bg-gray-50"
                      aria-hidden="true"
                    />
                    <div className="relative flex min-w-0 flex-1 items-center">
                      <span className="relative inline-block flex-shrink-0">
                        <Tooltip
                          content={comment.creationUser}
                          contentColor="invert"
                          hideArrow={true}
                          placement={
                            positionComment == CommentPosition.RIGHT
                              ? 'bottom'
                              : 'right'
                          }
                          css={{
                            color: '#6B7280',
                            border: '1px solid #6B7280',
                            backgroundColor: '#F3F4F6',
                            textAlign: 'center',
                          }}
                        >
                          {!comment.is_private ? (
                            <img
                              className={`h-10 w-10 p-1 ${user?.id == comment.created_by ? 'rounded-full border border-blue-400' : null}`}
                              src={`/refinery/avatars/${comment.avatarUri}`}
                              alt=""
                            />
                          ) : (
                            <IconEyeOff
                              className={`h-10 w-10 p-1 ${user?.id == comment.created_by ? 'rounded-full border border-blue-400' : null}`}
                            />
                          )}
                        </Tooltip>
                      </span>
                      <div className="ml-4 truncate">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {comment.xfkeyAdd}
                        </p>
                        <p
                          className="truncate text-sm text-gray-500"
                          style={{ maxWidth: '300px' }}
                        >
                          {comment.comment}
                        </p>
                      </div>
                    </div>
                  </a>

                  <Menu
                    as="div"
                    className="absolute right-0 inline-block flex-shrink-0 text-left"
                  >
                    <Menu.Button
                      className="group relative inline-flex h-8 w-8 items-center justify-center rounded-full disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={comment.created_by != user.id}
                    >
                      <span className="flex h-full w-full items-center justify-center rounded-full">
                        <IconDotsVertical
                          size={24}
                          strokeWidth={2}
                          className="font-bold text-gray-700"
                        />
                      </span>
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-3 top-3 z-10 w-32 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="py-1">
                          <Menu.Item>
                            {({ active }) => (
                              <a
                                onClick={(event: any) => {
                                  event.stopPropagation()
                                  props.handleEditClick(index)
                                  if (!props.openComments[index]) {
                                    props.handleCommentClick(index)
                                  }
                                }}
                                className={combineClassNames(
                                  active
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-700',
                                  'block cursor-pointer p-2 text-sm',
                                )}
                              >
                                <div className="flex flex-row items-center">
                                  <IconEdit
                                    className={`h-5 w-5 font-bold ${active ? 'text-gray-900' : 'text-gray-700'}`}
                                  />
                                  <span className="ml-2">Edit</span>
                                </div>
                              </a>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <a
                                onClick={(event: any) => {
                                  event.stopPropagation()
                                  props.editComment(
                                    event,
                                    comment.id,
                                    'is_private',
                                    !comment.is_private,
                                    index,
                                  )
                                }}
                                className={combineClassNames(
                                  active
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-700',
                                  'block cursor-pointer p-2 text-sm',
                                )}
                              >
                                <div className="flex flex-row items-center">
                                  {!comment.is_private && (
                                    <>
                                      <IconEyeOff
                                        className={`h-5 w-5 font-bold ${active ? 'text-gray-900' : 'text-gray-700'}`}
                                      />
                                      <span className="ml-2">Private</span>
                                    </>
                                  )}
                                  {comment.is_private && (
                                    <>
                                      <IconEye
                                        className={`h-5 w-5 font-bold ${active ? 'text-gray-900' : 'text-gray-700'}`}
                                      />
                                      <span className="ml-2">Public</span>
                                    </>
                                  )}
                                </div>
                              </a>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <a
                                onClick={() => props.deleteComment(comment.id)}
                                className={combineClassNames(
                                  active
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-700',
                                  'block cursor-pointer p-2 text-sm',
                                )}
                              >
                                <div className="flex flex-row items-center">
                                  <IconTrash
                                    className={`h-5 w-5 font-bold ${active ? 'text-gray-900' : 'text-gray-700'}`}
                                  />
                                  <span className="ml-2">Delete</span>
                                </div>
                              </a>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </li>
              <textarea
                disabled={props.editComments[index] ? false : true}
                className={`placeholder-italic line-height-textarea h-28 max-h-28 w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none ${props.openComments[index] ? '' : 'hidden'} disabled:cursor-not-allowed disabled:opacity-50`}
                onChange={(event: any) => {
                  const target = event.target as HTMLTextAreaElement
                  const finalHeight = target.scrollHeight + 2
                  const maxHeight = parseInt(
                    window
                      .getComputedStyle(target)
                      .getPropertyValue('max-height'),
                  )
                  target.style.height = `${finalHeight}px`
                  target.style.overflowY =
                    finalHeight < maxHeight ? 'hidden' : 'auto'
                  props.handleCommentTextChange(event.target.value, index)
                }}
                onBlur={(event: any) => {
                  if (props.editComments[index])
                    props.editComment(
                      event,
                      comment.id,
                      'comment',
                      event.target.value,
                      index,
                    )
                }}
                onKeyUp={(e: any) => e.stopPropagation()}
                onKeyDown={(event: any) => {
                  checkIfKeyShiftEnterUpdate(
                    event,
                    comment.id,
                    event.target.value,
                    index,
                  )
                }}
                value={props.commentTexts[index]}
              ></textarea>
            </div>
          ))}
        </ul>
      ) : (
        <div className="px-4 pt-4 text-xs font-normal text-gray-500">
          No comments added
        </div>
      )}
    </div>
  )
}
