import Modal from '@/src/components/shared/modal/Modal'
import { closeModal, selectModal } from '@/src/reduxStore/states/modal'
import { selectProjectId } from '@/src/reduxStore/states/project'
import { CREATE_PERSONAL_ACCESS_TOKEN } from '@/src/services/gql/mutations/project-admin'
import { PersonalTokenModalProps } from '@/src/types/components/projects/projectId/project-admin'
import { ModalEnum } from '@/src/types/shared/modal'
import {
  EXPIRATION_TIME,
  READ_WRITE_SCOPE,
} from '@/src/util/components/projects/projectId/project-admin-helper'
import { TOOLTIPS_DICT } from '@/src/util/tooltip-constants'
import { copyToClipboard } from '@/submodules/javascript-functions/general'
import Dropdown2 from '@/submodules/react-components/components/Dropdown2'
import { useMutation } from '@apollo/client'
import { Tooltip } from '@nextui-org/react'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { timer } from 'rxjs'

export default function NewPersonalToken(props: PersonalTokenModalProps) {
  const dispatch = useDispatch()

  const projectId = useSelector(selectProjectId)
  const modalNewToken = useSelector(selectModal(ModalEnum.NEW_PERSONAL_TOKEN))

  const [expirationTime, setExpirationTime] = useState(EXPIRATION_TIME[0])
  const [tokenName, setTokenName] = useState('')
  const [duplicateTokenName, setDuplicateTokenName] = useState(false)
  const [newToken, setNewToken] = useState<string>(null)
  const [tokenCopied, setTokenCopied] = useState(false)

  const [createNewTokenMut] = useMutation(CREATE_PERSONAL_ACCESS_TOKEN)

  useEffect(() => {
    if (!modalNewToken.open) {
      setTokenName('')
      setExpirationTime(EXPIRATION_TIME[0])
      setNewToken(null)
      setTokenCopied(false)
      setDuplicateTokenName(false)
    }
  }, [modalNewToken])

  const createNewToken = useCallback(() => {
    createNewTokenMut({
      variables: {
        projectId: projectId,
        name: tokenName,
        expiresAt: expirationTime.value,
        scope: READ_WRITE_SCOPE,
      },
    }).then((res) => {
      setNewToken(res['data']['createPersonalAccessToken']['token'])
      props.refetchTokens()
      setTokenName('')
      setDuplicateTokenName(false)
      setExpirationTime(EXPIRATION_TIME[0])
    })
  }, [projectId, tokenName, expirationTime, tokenCopied])

  function checkIfDuplicateTokenName(tokenName: string) {
    const duplicate = props.accessTokens.find(
      (token: any) => token.name == tokenName,
    )
    setDuplicateTokenName(duplicate != undefined)
  }

  function copyToken(newToken) {
    setTokenCopied(true)
    copyToClipboard(newToken)
    timer(1000).subscribe(() => setTokenCopied(false))
  }

  return (
    <Modal modalName={ModalEnum.NEW_PERSONAL_TOKEN} hasOwnButtons={true}>
      <div className="flex flex-grow justify-center text-lg font-medium leading-6 text-gray-900">
        Add a personal access token{' '}
      </div>
      <div className="mb-2 flex flex-row items-center justify-center">
        <div className="text-xs font-bold text-gray-500">
          This token is created only once and can not be restored. Please keep
          it safe.
        </div>
      </div>
      <div
        className="grid max-w-sm grid-cols-2 items-center gap-2"
        style={{ gridTemplateColumns: 'max-content auto' }}
      >
        <Tooltip
          content={TOOLTIPS_DICT.ADMIN_PAGE.EXPIRATION_TIME}
          color="invert"
          placement="right"
        >
          <span className="card-title label-text mb-0 flex cursor-help">
            <span className="filtersUnderline underline">Expiration time</span>
          </span>
        </Tooltip>
        <Dropdown2
          buttonName={expirationTime.name}
          options={EXPIRATION_TIME}
          selectedOption={(option: any) => setExpirationTime(option)}
          dropdownClasses="w-full"
        />

        <Tooltip
          content={TOOLTIPS_DICT.ADMIN_PAGE.NAME_TOKEN}
          color="invert"
          placement="right"
        >
          <span className="card-title label-text mb-0 flex cursor-help">
            <span className="filtersUnderline underline">Name</span>
          </span>
        </Tooltip>
        <input
          value={tokenName}
          onChange={(e) => setTokenName(e.target.value)}
          onInput={(e: any) => checkIfDuplicateTokenName(e.target.value)}
          className="placeholder-italic h-9 w-full rounded-md border border-gray-300 pl-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
          placeholder="Token name"
        />
        <Tooltip
          content={TOOLTIPS_DICT.ADMIN_PAGE.VALUE_TOKEN}
          color="invert"
          placement="right"
        >
          <span className="card-title label-text mb-0 flex cursor-help">
            <span className="filtersUnderline underline">Token</span>
          </span>
        </Tooltip>
        <div className="flex flex-row flex-nowrap items-center justify-between gap-x-2">
          <span
            style={{ width: '22.5rem', minHeight: '2.25rem' }}
            className="block break-all rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          >
            {newToken}
          </span>

          <Tooltip
            content={tokenCopied ? TOOLTIPS_DICT.ADMIN_PAGE.TOKEN_COPIED : ''}
            color="invert"
            placement="right"
          >
            <div className="flex items-center">
              <button
                disabled={!newToken}
                onClick={() => {
                  newToken ? copyToken(newToken) : null
                }}
                className="inline-block rounded border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Copy to clipboard
              </button>
            </div>
          </Tooltip>
        </div>
      </div>
      {duplicateTokenName && (
        <div className="my-2 flex flex-row items-center justify-between">
          <div className="text-xs font-normal text-red-500">
            Token with name {tokenName} already exists.
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={createNewToken}
          disabled={tokenName == '' || duplicateTokenName}
          className={`mr-4 flex cursor-pointer items-center rounded-md border border-green-400 bg-green-100 px-4 text-xs font-semibold text-green-700 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
          type="submit"
        >
          Add token
        </button>
        <button
          onClick={() => {
            dispatch(closeModal(ModalEnum.NEW_PERSONAL_TOKEN))
            setTokenName('')
            setExpirationTime(EXPIRATION_TIME[0])
            setNewToken(null)
            copyToClipboard(newToken)
          }}
          className="cursor-pointer rounded border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Close
        </button>
      </div>
    </Modal>
  )
}
