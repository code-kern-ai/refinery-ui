import Modal from "@/src/components/shared/modal/Modal";
import { closeModal, selectModal } from "@/src/reduxStore/states/modal";
import { selectProjectId } from "@/src/reduxStore/states/project";
import { CREATE_PERSONAL_ACCESS_TOKEN } from "@/src/services/gql/mutations/project-admin";
import { PersonalTokenModalProps } from "@/src/types/components/projects/projectId/project-admin";
import { ModalEnum } from "@/src/types/shared/modal";
import { EXPIRATION_TIME, READ_WRITE_SCOPE } from "@/src/util/components/projects/projectId/project-admin-helper";
import { TOOLTIPS_DICT } from "@/src/util/tooltip-constants";
import { copyToClipboard } from "@/submodules/javascript-functions/general";
import Dropdown2 from "@/submodules/react-components/components/Dropdown2";
import { useMutation } from "@apollo/client";
import { Tooltip } from "@nextui-org/react";
import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function NewPersonalToken(props: PersonalTokenModalProps) {
    const dispatch = useDispatch();

    const projectId = useSelector(selectProjectId);
    const modalNewToken = useSelector(selectModal(ModalEnum.NEW_PERSONAL_TOKEN));

    const [expirationTime, setExpirationTime] = useState(EXPIRATION_TIME[0]);
    const [tokenName, setTokenName] = useState('');
    const [duplicateTokenName, setDuplicateTokenName] = useState(false);
    const [newToken, setNewToken] = useState<string>(null);
    const [tokenCopied, setTokenCopied] = useState(false);

    const [createNewTokenMut] = useMutation(CREATE_PERSONAL_ACCESS_TOKEN);

    const createNewToken = useCallback(() => {
        // const expirationValue = EXPIRATION_TIME.find(a => a.name == expirationTime).value;
        createNewTokenMut({ variables: { projectId: projectId, name: tokenName, expiresAt: expirationTime.value, scope: READ_WRITE_SCOPE } }).then((res) => {
            setNewToken(res['data']['createPersonalAccessToken']['token']);
            props.refetchTokens();
        });
    }, [projectId, tokenName, expirationTime]);

    function checkIfDuplicateTokenName(tokenName: string) {
        const duplicate = modalNewToken?.tokenNames?.find((token: any) => token.name == tokenName);
        setDuplicateTokenName(duplicate);
    }

    return (<Modal modalName={ModalEnum.NEW_PERSONAL_TOKEN} hasOwnButtons={true}>
        <div className="flex flex-grow justify-center text-lg leading-6 text-gray-900 font-medium">Add a personal access token </div>
        <div className="flex flex-row justify-center items-center mb-2">
            <div className="text-gray-500 text-xs font-bold">This token is created only once and can not be restored. Please keep it safe.</div>
        </div>
        <div className="grid grid-cols-2 gap-2 items-center max-w-sm" style={{ gridTemplateColumns: 'max-content auto' }}>
            <Tooltip content={TOOLTIPS_DICT.ADMIN_PAGE.EXPIRATION_TIME} color="invert" placement="right">
                <span className="cursor-help card-title mb-0 label-text flex"><span className="underline filtersUnderline">Expiration time</span></span>
            </Tooltip>
            <Dropdown2 buttonName={expirationTime.name} options={EXPIRATION_TIME} selectedOption={(option: any) => setExpirationTime(option)} dropdownClasses="w-full" />


            <Tooltip content={TOOLTIPS_DICT.ADMIN_PAGE.NAME_TOKEN} color="invert" placement="right">
                <span className="cursor-help card-title mb-0 label-text flex"><span className="underline filtersUnderline">Name</span></span>
            </Tooltip>
            <input value={tokenName} onChange={(e) => setTokenName(e.target.value)}
                onInput={(e: any) => checkIfDuplicateTokenName(e.target.value)}
                className="h-9 w-full text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100" placeholder="Token name" />
            <Tooltip content={TOOLTIPS_DICT.ADMIN_PAGE.VALUE_TOKEN} color="invert" placement="right">
                <span className="cursor-help card-title mb-0 label-text flex"><span className="underline filtersUnderline">Token</span></span>
            </Tooltip>
            <div className="flex flex-row flex-nowrap justify-between items-center gap-x-2">
                <span style={{ width: '22.5rem', minHeight: '2.25rem' }}
                    className="text-xs block px-4 py-2 text-gray-900 break-all border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">{newToken}</span>

                <Tooltip content={tokenCopied ? TOOLTIPS_DICT.ADMIN_PAGE.TOKEN_COPIED : ''} color="invert" placement="right">
                    <div className="flex items-center">
                        <button disabled={!newToken} onClick={() => { newToken ? copyToClipboard(newToken) : null; setTokenCopied(true); }}
                            className="bg-white text-gray-700 text-xs font-semibold px-4 py-2 rounded border border-gray-300 hover:bg-gray-50 inline-block disabled:opacity-50 disabled:cursor-not-allowed">Copy to clipboard</button>
                    </div>
                </Tooltip>
            </div>
        </div>
        {duplicateTokenName && <div className="flex flex-row justify-between items-center my-2">
            <div className="text-red-500 text-xs font-normal">Token with name {tokenName} already exists.</div>
        </div>
        }

        <div className="flex mt-6 justify-end">
            <button onClick={createNewToken} disabled={tokenName == "" || duplicateTokenName}
                className={`bg-green-100 flex items-center mr-4 text-green-700 border border-green-400 text-xs font-semibold px-4 rounded-md cursor-pointer hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed`} type="submit">
                Add token
            </button>
            <button onClick={() => {
                dispatch(closeModal(ModalEnum.NEW_PERSONAL_TOKEN));
                setTokenName('');
                setExpirationTime(EXPIRATION_TIME[0]);
                setNewToken(null);
            }} className="bg-white text-gray-700 text-xs font-semibold px-4 py-2 rounded border border-gray-300 cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Close
            </button>
        </div>
    </Modal >)
}