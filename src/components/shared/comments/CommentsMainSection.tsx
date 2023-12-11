import { CommentMainSectionProps, CommentPosition } from "@/src/types/shared/comments";
import { useLocalStorage } from "@/submodules/react-components/hooks/useLocalStorage";
import { Dialog, Transition } from "@headlessui/react";
import { Tooltip } from "@nextui-org/react";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { Fragment, useCallback, useState } from "react";

export default function CommentsMainSection(props: CommentMainSectionProps) {
    const [positionComment, setPositionComment] = useLocalStorage<CommentPosition>('positionComment', 'comments', undefined, CommentPosition.RIGHT);
    const [allOpen, setAllOpen] = useState(false);

    const flipCommentPosition = useCallback(() => {
        setPositionComment(positionComment == CommentPosition.RIGHT ? CommentPosition.LEFT : CommentPosition.RIGHT);
    }, [positionComment]);

    const openAllComments = useCallback((open: boolean) => {
        setAllOpen(open);
    }, [allOpen]);

    return (
        <Transition.Root show={props.open} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={props.toggleOpen}>
                <div className="fixed inset-0" />

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className={`pointer-events-none fixed inset-y-0 flex max-w-full ${positionComment == CommentPosition.RIGHT ? 'right-0' : 'left-0'}`}>
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
                                            {positionComment == CommentPosition.RIGHT ? <div className='cursor-pointer' onClick={flipCommentPosition}>
                                                <IconArrowLeft size={24}
                                                    strokeWidth={2}
                                                    className='text-gray-700 font-bold cursor-pointer' />
                                            </div> : <div className='cursor-pointer' onClick={flipCommentPosition}>
                                                <IconArrowRight size={24}
                                                    strokeWidth={2}
                                                    className='text-gray-700 font-bold cursor-pointer' />
                                            </div>}
                                            <Dialog.Title className="text-base flex m-auto font-bold leading-6 text-gray-900 cursor-pointer" onClick={() => openAllComments(!allOpen)}>
                                                <Tooltip content={allOpen ? 'Close all' : 'Open all'} contentColor="invert" hideArrow={true} placement='bottom'
                                                    css={{ color: '#6B7280', border: '1px solid #6B7280', backgroundColor: '#F3F4F6', textAlign: 'center' }}>
                                                    Comments
                                                </Tooltip>
                                            </Dialog.Title>
                                        </div>

                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    )
}