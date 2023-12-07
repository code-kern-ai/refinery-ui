import Modal from "@/src/components/shared/modal/Modal";
import { selectModal } from "@/src/reduxStore/states/modal";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { ModalButton, ModalEnum } from "@/src/types/shared/modal";
import { EXPIRATION_TIME } from "@/src/util/components/projects/projectId/project-admin-helper";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import Dropdown from "@/submodules/react-components/components/Dropdown";
import { Tooltip } from "@nextui-org/react";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";

const ACCEPT_BUTTON = { buttonCaption: 'Add token', useButton: true, disabled: true };

export default function NewPersonalToken() {
    const projectId = useSelector(selectProjectId);
    const modalNewToken = useSelector(selectModal(ModalEnum.NEW_PERSONAL_TOKEN));

    const [expirationTime, setExpirationTime] = useState(EXPIRATION_TIME[0]);
    const [tokenName, setTokenName] = useState('');
    const [duplicateTokenName, setDuplicateTokenName] = useState(false);
    const [newToken, setNewToken] = useState<any>({});

    const createNewToken = useCallback(() => {

    }, [projectId]);

    const [acceptButton, setAcceptButton] = useState<ModalButton>(ACCEPT_BUTTON);

    useEffect(() => {
        setAcceptButton({ ...acceptButton, disabled: tokenName == "" || duplicateTokenName, emitFunction: createNewToken });
    }, [expirationTime, tokenName, duplicateTokenName]);

    function checkIfDuplicateTokenName(tokenName: string) {
        const duplicate = modalNewToken?.tokenNames?.find((token: any) => token.name == tokenName);
        setDuplicateTokenName(duplicate);
    }

    return (<Modal modalName={ModalEnum.NEW_PERSONAL_TOKEN} acceptButton={acceptButton}>
        <div className="flex flex-grow justify-center text-lg leading-6 text-gray-900 font-medium">Add a personal access token </div>
        <div className="flex flex-row justify-center items-center mb-2">
            <div className="text-gray-500 text-xs font-bold">This token is created only once and can not be restored. Please keep it safe.</div>
        </div>
        <div className="grid grid-cols-2 gap-2 items-center max-w-sm" style={{ gridTemplateColumns: 'max-content auto' }}>
            <Tooltip content={TOOLTIPS_DICT.ADMIN_PAGE.EXPIRATION_TIME} color="invert" placement="right">
                <span className="cursor-help card-title mb-0 label-text flex"><span className="underline filtersUnderline">Expiration time</span></span>
            </Tooltip>
            <Dropdown buttonName={expirationTime} options={EXPIRATION_TIME} selectedOption={(option: string) => setExpirationTime(option)} dropdownClasses="w-full" />

            <Tooltip content={TOOLTIPS_DICT.ADMIN_PAGE.NAME_TOKEN} color="invert" placement="right">
                <span className="cursor-help card-title mb-0 label-text flex"><span className="underline filtersUnderline">Name</span></span>
            </Tooltip>
            <input value={tokenName} onChange={(e) => setTokenName(e.target.value)}
                onInput={(e: any) => checkIfDuplicateTokenName(e.target.value)}
                className="h-9 w-full border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" />
            <Tooltip content={TOOLTIPS_DICT.ADMIN_PAGE.VALUE_TOKEN} color="invert" placement="right">
                <span className="cursor-help card-title mb-0 label-text flex"><span className="underline filtersUnderline">Token</span></span>
            </Tooltip>
        </div>
        {duplicateTokenName && <div className="flex flex-row justify-between items-center my-2">
            <div className="text-red-500 text-xs font-normal">Token with name {tokenName} already exists.</div>
        </div>}
    </Modal>)
}