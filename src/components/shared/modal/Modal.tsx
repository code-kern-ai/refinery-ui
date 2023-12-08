import { useEffect, useState } from 'react';
import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { isStringTrue } from '@/submodules/javascript-functions/general';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, closeModal, initModal, openModal, selectModal } from '@/src/reduxStore/states/modal';
import { ModalButton, ModalButtonType } from '@/src/types/shared/modal';
import { modalButtonCaption } from '@/src/util/shared/modal-helper';


export default function Modal(props: any) {
    const dispatch = useDispatch();
    const modal = useSelector(selectModal(props.modalName));

    const [hasOwnButtons, setHasOwnButtons] = useState(false);

    useEffect(() => {
        fillButtons();
    }, [props.acceptButton, props.abortButton, props.backButton, props.secondAcceptButton]);

    useEffect(() => {
        if (props.hasOwnButtons != undefined) setHasOwnButtons(props.hasOwnButtons);
        else setHasOwnButtons(false);
    }, [props.hasOwnButtons]);

    function fullInit() {
        dispatch(initModal(props.modalName));
    }

    function setOpen(value: boolean) {
        if (value) dispatch(openModal(props.modalName));
        else if (!props.doNotFullyInit) fullInit();  // to ensure the modal is fully reset
        else dispatch(closeModal(props.modalName))
    }

    function fillButtons() {
        if (props.acceptButton == undefined) {
            const newProps = {
                ...props,
                acceptButton: { useButton: true }
            };
            props = newProps;
        }
        else {
            if (typeof props.acceptButton == "string") props.acceptButton = { useButton: isStringTrue(props.acceptButton as string) };
            else if (typeof props.acceptButton == "boolean") props.acceptButton = { useButton: props.acceptButton };
            if (props.acceptButton) initButton(props.acceptButton, ModalButtonType.ACCEPT);
        }
        if (props.abortButton == undefined) {
            const newProps = {
                ...props,
                abortButton: { useButton: false }
            };
            props = newProps;
        }
        else {
            if (typeof props.abortButton == "string") props.abortButton = { useButton: isStringTrue(props.abortButton as string) };
            else if (typeof props.abortButton == "boolean") props.abortButton = { useButton: props.abortButton };
            if (props.abortButton) initButton(props.abortButton, ModalButtonType.ABORT);
        }
        if (props.backButton == undefined) {
            const newProps = {
                ...props,
                backButton: { useButton: false }
            };
            props = newProps;
        }
        else {
            if (typeof props.backButton == "string") props.backButton = { useButton: isStringTrue(props.backButton as string) };
            else if (typeof props.backButton == "boolean") props.backButton = { useButton: props.backButton };
            if (props.backButton) initButton(props.backButton, ModalButtonType.BACK);
        }
        if (props.secondAcceptButton == undefined) {
            const newProps = {
                ...props,
                secondAcceptButton: { useButton: false }
            };
            props = newProps;
        }
        else {
            if (typeof props.secondAcceptButton == "string") props.secondAcceptButton = { useButton: isStringTrue(props.secondAcceptButton as string) };
            else if (typeof props.secondAcceptButton == "boolean") props.secondAcceptButton = { useButton: props.secondAcceptButton };
            if (props.secondAcceptButton) initButton(props.secondAcceptButton, ModalButtonType.ACCEPT);
        }

    }
    function initButton(button: ModalButton, buttonType: ModalButtonType) {
        if (button) {
            button.type = buttonType;
            if (button.useButton != false) button.useButton = true;
            if (!button.buttonCaption) button.buttonCaption = modalButtonCaption(buttonType);
            if (!button.disabled) button.disabled = false;
            if (button.closeAfterClick != false) button.closeAfterClick = true;
        }
    }

    function clickButton(button: ModalButton) {
        if (button.emitFunction) button.emitFunction.call(button, button.type);

        if (props.observers?.length > 0) props.optionClicked.emit(button.type);

        if (button.closeAfterClick) setOpen(false);
    }


    return (
        <Transition.Root show={modal.open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={setOpen}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-50">
                    <div className="flex min-h-full justify-center p-4 text-center items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6 modal-width">
                                <div className="mt-3 text-center sm:mt-0">
                                    <div>{props.children}</div>
                                </div>
                                {!hasOwnButtons && <div className="mt-5 flex justify-end">
                                    {props.acceptButton?.useButton ?
                                        <button disabled={props.acceptButton.disabled}
                                            className={`ml-2 bg-green-100 border border-green-400 text-green-700 text-xs font-semibold px-4 py-2 rounded-md cursor-pointer opacity-100 hover:bg-green-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50`}
                                            onClick={() => clickButton(props.acceptButton)}>{props.acceptButton.buttonCaption}</button> : null}
                                    {props.secondAcceptButton?.useButton ?
                                        <button disabled={props.acceptButton.disabled}
                                            className={`ml-2 bg-green-100 border border-green-400 text-green-700 text-xs font-semibold px-4 py-2 rounded-md cursor-pointer opacity-100 hover:bg-green-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50`}
                                            onClick={() => clickButton(props.secondAcceptButton)}>{props.secondAcceptButton.buttonCaption}</button> : null}
                                    {props.abortButton?.useButton ?
                                        <button disabled={props.abortButton.disabled}
                                            className={`ml-2 bg-red-100 border border-red-400 text-red-700 text-xs font-semibold px-4 py-2 rounded-md cursor-pointer opacity-100 hover:bg-red-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50`}
                                            onClick={() => clickButton(props.abortButton)}>{props.abortButton.buttonCaption}</button> : null}
                                    {props.backButton?.useButton ?
                                        <button disabled={props.backButton.disabled}
                                            className={`ml-2 bg-white border border-gray-300 text-gray-700 text-xs font-semibold px-4 py-2 rounded-md cursor-pointer opacity-100 hover:bg-gray-50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50`}
                                            onClick={() => clickButton(props.backButton)}>{props.backButton.buttonCaption}</button> : null}
                                    <button className="ml-2 bg-white text-gray-700 border border-gray-300 text-xs font-semibold px-4 py-2 rounded cursor-pointer hover:bg-gray-50 focus:outline-none"
                                        onClick={() => setOpen(false)}>Close</button>
                                </div>}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    )
}