import { openModal, setModalStates } from '@/src/reduxStore/states/modal'
import { selectProjectId } from '@/src/reduxStore/states/project'
import { GET_ALL_PERSONAL_ACCESS_TOKENS } from '@/src/services/gql/queries/project-admin'
import { PersonalAccessToken } from '@/src/types/components/projects/projectId/project-admin'
import { ModalEnum } from '@/src/types/shared/modal'
import { postProcessPersonalAccessToken } from '@/src/util/components/projects/projectId/project-admin-helper'
import { TOOLTIPS_DICT } from '@/src/util/tooltip-constants'
import { useLazyQuery } from '@apollo/client'
import { Tooltip } from '@nextui-org/react'
import { IconPlus, IconTrash } from '@tabler/icons-react'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import NewPersonalToken from './NewPersonalTokenModal'
import DeletePersonalToken from './DeletePersonalTokenModal'
import { CurrentPage } from '@/src/types/shared/general'
import { useRouter } from 'next/router'
import { selectIsAdmin } from '@/src/reduxStore/states/general'
import { useWebsocket } from '@/src/services/base/web-sockets/useWebsocket'

export default function ProjectAdmin() {
  const router = useRouter()
  const dispatch = useDispatch()

  const projectId = useSelector(selectProjectId)
  const isAdmin = useSelector(selectIsAdmin)

  const [accessTokens, setAccessTokens] = useState<PersonalAccessToken[]>([])

  const [refetchAccessTokens] = useLazyQuery(GET_ALL_PERSONAL_ACCESS_TOKENS, {
    fetchPolicy: 'network-only',
  })

  useEffect(() => {
    if (!projectId) return
    refetchAccessTokensAndProcess()

    if (!isAdmin) {
      console.log('you should not be here')
      router.push(`/projects`)
      return
    }
  }, [projectId])

  function refetchAccessTokensAndProcess() {
    refetchAccessTokens({ variables: { projectId: projectId } }).then((res) => {
      setAccessTokens(
        postProcessPersonalAccessToken(res.data['allPersonalAccessTokens']),
      )
    })
  }

  const handleWebsocketNotification = useCallback(
    (msgParts: string[]) => {
      if (msgParts[1] == 'pat') {
        if (!accessTokens) return // to ensure the program doesn't crash if the data wasn't loaded yet but the websocket already tells us to refetch
        const id = msgParts[2]
        if (accessTokens.find((p) => p.id == id)) {
          refetchAccessTokensAndProcess()
        }
      }
    },
    [accessTokens],
  )

  useWebsocket(CurrentPage.ADMIN_PAGE, handleWebsocketNotification, projectId)

  return (
    <>
      {accessTokens && (
        <div className="flex h-full flex-1 flex-col overflow-y-auto bg-gray-100 p-4">
          <div className="inline-block w-full text-lg font-medium leading-6 text-gray-900">
            <label>Personal Access Tokens</label>
          </div>
          <div className="mt-1">
            <div className="inline-block text-sm font-medium leading-5 text-gray-700">
              Manage project-based personal access tokens used to interact with
              Refinery’s commercial proxy.
            </div>
            <div className="mt-2 inline-block min-w-full align-middle">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500"
                      >
                        Scope
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500"
                      >
                        Created by
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500"
                      >
                        Created at
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500"
                      >
                        Expires at
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500"
                      >
                        Last used
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500"
                      ></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {accessTokens.map(
                      (token: PersonalAccessToken, index: number) => (
                        <tr
                          key={token.id}
                          className={`${index % 2 != 0 ? 'bg-gray-50' : 'bg-white'}`}
                        >
                          <td className="whitespace-nowrap px-3 py-2 text-center text-sm text-gray-500">
                            {token.name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 text-center text-sm text-gray-500">
                            {token.scope}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 text-center text-sm text-gray-500">
                            {token.createdBy}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 text-center text-sm text-gray-500">
                            {token.createdAt}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 text-center text-sm text-gray-500">
                            {token.expiresAt}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 text-center text-sm text-gray-500">
                            {token.lastUsed}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 text-center text-sm text-gray-500">
                            <IconTrash
                              onClick={() =>
                                dispatch(
                                  setModalStates(
                                    ModalEnum.DELETE_PERSONAL_TOKEN,
                                    { tokenId: token.id, open: true },
                                  ),
                                )
                              }
                              className="h-6 w-6 cursor-pointer text-red-700"
                            />
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="mt-1">
            <Tooltip
              content={TOOLTIPS_DICT.ADMIN_PAGE.NEW_ACCESS_TOKEN}
              color="invert"
              placement="right"
            >
              <button
                onClick={() =>
                  dispatch(openModal(ModalEnum.NEW_PERSONAL_TOKEN))
                }
                className="inline-flex cursor-pointer items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
              >
                <IconPlus className="mr-1" size={20} />
                Add token
              </button>
            </Tooltip>
          </div>
          <NewPersonalToken
            refetchTokens={refetchAccessTokensAndProcess}
            accessTokens={accessTokens}
          />
          <DeletePersonalToken refetchTokens={refetchAccessTokensAndProcess} />
        </div>
      )}
    </>
  )
}
