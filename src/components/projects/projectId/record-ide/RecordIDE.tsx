import BricksIntegrator from '@/src/components/shared/bricks-integrator/BricksIntegrator'
import LoadingIcon from '@/src/components/shared/loading/LoadingIcon'
import MultilineTooltip from '@/src/components/shared/multilines-tooltip/MultilineTooltip'
import {
  selectAllUsers,
  setBricksIntegrator,
  setComments,
} from '@/src/reduxStore/states/general'
import { selectProjectId } from '@/src/reduxStore/states/project'
import { REQUEST_COMMENTS } from '@/src/services/gql/queries/projects'
import { RUN_RECORD_IDE } from '@/src/services/gql/queries/record-ide'
import { CommentType } from '@/src/types/shared/comments'
import { CurrentPage } from '@/src/types/shared/general'
import { CommentDataManager } from '@/src/util/classes/comments'
import {
  DEFAULT_CODE,
  PASS_ME,
  caesarCipher,
} from '@/src/util/components/projects/projectId/record-ide/record-ide-helper'
import { getEmptyBricksIntegratorConfig } from '@/src/util/shared/bricks-integrator-helper'
import { TOOLTIPS_DICT } from '@/src/util/tooltip-constants'
import { tryParseJSON } from '@/submodules/javascript-functions/general'
import { useLazyQuery } from '@apollo/client'
import { Editor } from '@monaco-editor/react'
import { Tooltip } from '@nextui-org/react'
import {
  IconArrowBack,
  IconArrowBigUp,
  IconBorderHorizontal,
  IconBorderVertical,
} from '@tabler/icons-react'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { timer } from 'rxjs'

const EDITOR_OPTIONS = { theme: 'vs-light', language: 'python' }

export default function RecordIDE() {
  const dispatch = useDispatch()
  const router = useRouter()

  const projectId = useSelector(selectProjectId)
  const allUsers = useSelector(selectAllUsers)

  const [vertical, setVertical] = useState(true)
  const [canLoadFromLocalStorage, setCanLoadFromLocalStorage] = useState(false)
  const [code, setCode] = useState(DEFAULT_CODE)
  const [screenHeight, setScreenHeight] = useState('')
  const [position, setPosition] = useState(0)
  const [loading, setLoading] = useState(false)
  const [output, setOutput] = useState('')
  const [debounceTimer, setDebounceTimer] = useState(null)

  const [refetchRecordIde] = useLazyQuery(RUN_RECORD_IDE, {
    fetchPolicy: 'network-only',
  })
  const [refetchComments] = useLazyQuery(REQUEST_COMMENTS, {
    fetchPolicy: 'no-cache',
  })

  const huddleData = JSON.parse(localStorage.getItem('huddleData'))

  useEffect(() => {
    if (!projectId) return
    const horizontal = JSON.parse(localStorage.getItem('ideHorizontal'))
    if (horizontal) {
      setVertical(!horizontal)
    }
    setCanLoadFromLocalStorage(!!localStorage.getItem('ideCode'))
    setPosition(parseInt(router.query.pos as string))
  }, [projectId])

  useEffect(() => {
    if (!position) return
    runRecordIde()
  }, [position])

  useEffect(() => {
    changeScreenSize()
    window.addEventListener('resize', changeScreenSize)
    return () => window.removeEventListener('resize', changeScreenSize)
  }, [vertical])

  useEffect(() => {
    if (!projectId || allUsers.length == 0) return
    setUpCommentsRequests()
  }, [allUsers, projectId])

  useEffect(() => {
    if (!projectId || !huddleData || !code) return
    const shortcutRunIde = (event) => {
      if (event.shiftKey && event.key === 'Enter') {
        runRecordIde()
      }
    }

    document.addEventListener('keyup', shortcutRunIde)
    return () => {
      document.removeEventListener('keyup', shortcutRunIde)
    }
  }, [projectId, huddleData, code])

  function setUpCommentsRequests() {
    const requests = []
    requests.push({ commentType: CommentType.ATTRIBUTE, projectId: projectId })
    requests.push({
      commentType: CommentType.KNOWLEDGE_BASE,
      projectId: projectId,
    })
    CommentDataManager.unregisterCommentRequests(CurrentPage.RECORD_IDE)
    CommentDataManager.registerCommentRequests(CurrentPage.RECORD_IDE, requests)
    const requestJsonString = CommentDataManager.buildRequestJSON()
    refetchComments({ variables: { requested: requestJsonString } }).then(
      (res) => {
        CommentDataManager.parseCommentData(
          JSON.parse(res.data['getAllComments']),
        )
        CommentDataManager.parseToCurrentData(allUsers)
        dispatch(setComments(CommentDataManager.currentDataOrder))
      },
    )
  }

  function goToLabelingPage() {
    const sessionId = router.query.sessionId as string
    const pos = router.query.pos as string
    router.push(`/projects/${projectId}/labeling/${sessionId}?pos=${pos}`)
  }

  function loadCodeFromLocalStorage() {
    const existingCode = localStorage.getItem('ideCode')
    if (existingCode) {
      let code = tryParseJSON(existingCode)
      if (!code || !code.code) {
        code = existingCode // old code
      } else {
        code = caesarCipher(code.code, PASS_ME, true)
      }
      setCode(code)
    }
    runRecordIde()
  }

  function saveCodeToLocalStorage() {
    const toSave = { code: caesarCipher(code, PASS_ME) }
    localStorage.setItem('ideCode', JSON.stringify(toSave))
  }

  function switchView() {
    localStorage.setItem('ideHorizontal', JSON.stringify(vertical))
    location.reload()
  }

  const runRecordIde = useCallback(() => {
    if (!projectId) return
    setLoading(true)
    const recordId = huddleData.recordIds[position - 1]
    if (debounceTimer) debounceTimer.unsubscribe()
    const timerSave = timer(400).subscribe(() => {
      refetchRecordIde({
        variables: { projectId: projectId, recordId, code: code },
      }).then((res) => {
        if (!res.data || res.data['runRecordIde'] == null) {
          setOutput('')
          setLoading(false)
          return
        }
        setOutput(res.data['runRecordIde'])
        setLoading(false)
      })
    })
    setDebounceTimer(timerSave)
  }, [position, code, projectId, debounceTimer])

  function changeScreenSize() {
    const baseSize = window.innerHeight - 125
    if (vertical) {
      setScreenHeight(baseSize + 'px')
    } else {
      setScreenHeight(baseSize / 2 + 'px')
    }
  }

  function prevRecord() {
    const sessionId = router.query.sessionId as string
    router.push(
      `/projects/${projectId}/record-ide/${sessionId}?pos=${position - 1}`,
    )
    setPosition(position - 1)
    runRecordIde()
  }

  function nextRecord() {
    const sessionId = router.query.sessionId as string
    router.push(
      `/projects/${projectId}/record-ide/${sessionId}?pos=${position + 1}`,
    )
    setPosition(position + 1)
    runRecordIde()
  }

  function clearIde() {
    setOutput('')
  }

  return (
    <div className="relative h-full">
      {projectId && (
        <div
          className={`grid overflow-hidden bg-white ${vertical ? 'grid-cols-2' : 'grid-cols-1'}`}
        >
          <div className="h-full">
            <div className="m-3 flex items-center">
              <span className="mr-4">Editor</span>
              <Tooltip
                content={TOOLTIPS_DICT.RECORD_IDE.GO_TO_LABELING}
                color="invert"
                placement="right"
              >
                <button
                  onClick={goToLabelingPage}
                  className="mr-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <span>View labeling</span>
                </button>
              </Tooltip>
              <Tooltip
                content={TOOLTIPS_DICT.RECORD_IDE.LOAD_STORAGE}
                color="invert"
                placement="right"
              >
                <button
                  onClick={loadCodeFromLocalStorage}
                  disabled={!canLoadFromLocalStorage}
                  className="mr-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span>Load</span>
                </button>
              </Tooltip>
              <Tooltip
                content={TOOLTIPS_DICT.RECORD_IDE.SAVE_STORAGE}
                color="invert"
                placement="right"
              >
                <button
                  onClick={saveCodeToLocalStorage}
                  className="mr-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <span>Save</span>
                </button>
              </Tooltip>
              <span className="float-right ml-auto flex flex-row flex-nowrap items-center">
                <Tooltip
                  content={
                    vertical
                      ? TOOLTIPS_DICT.RECORD_IDE.SWITCH_TO_HORIZONTAL
                      : TOOLTIPS_DICT.RECORD_IDE.SWITCH_TO_VERTICAL
                  }
                  color="invert"
                  placement="left"
                >
                  <button
                    onClick={switchView}
                    className="mr-3 whitespace-nowrap rounded-md border border-gray-300 bg-white p-1 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {vertical ? (
                      <IconBorderHorizontal size={20} />
                    ) : (
                      <IconBorderVertical size={20} />
                    )}
                  </button>
                </Tooltip>
                <button
                  onClick={prevRecord}
                  disabled={position == 1}
                  className={`mr-3 whitespace-nowrap rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  Back
                </button>
                <button
                  onClick={nextRecord}
                  disabled={position == huddleData?.recordIds.length}
                  className={`mr-3 cursor-pointer whitespace-nowrap rounded-md bg-indigo-700 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  Next
                </button>
                <Tooltip
                  content={TOOLTIPS_DICT.RECORD_IDE.IDX_SESSION}
                  color="invert"
                  placement="left"
                  className="cursor-auto"
                >
                  <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-800">
                    {position}
                  </span>
                </Tooltip>
              </span>
            </div>
            <Editor
              className="h-full w-full"
              defaultLanguage={'python'}
              options={EDITOR_OPTIONS}
              value={code}
              height={screenHeight}
              onChange={(val) => setCode(val)}
            />
          </div>
          <div
            className={`h-screen border-gray-300 ${vertical ? 'border-l' : 'border-t'}`}
          >
            <div className="m-3 flex flex-row items-center">
              <span className="mr-4">Shell</span>
              <Tooltip
                content={
                  <MultilineTooltip
                    tooltipLines={[
                      'Press Shift + Enter in the editor',
                      'to run the code',
                    ]}
                  />
                }
                color="invert"
                placement="bottom"
              >
                <button
                  onClick={runRecordIde}
                  className="whitespace-break-spaces"
                >
                  <div className="mr-2 flex cursor-pointer items-center rounded-md border border-blue-300 bg-blue-50 px-4 py-2 text-xs font-medium text-blue-700 shadow-sm hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    <span>Run</span>
                    <kbd className="ml-2 inline-flex h-4 items-center rounded border border-gray-200 bg-white px-1 font-sans text-sm font-medium uppercase text-gray-400">
                      <IconArrowBigUp size={16} />
                      <IconArrowBack size={16} />
                    </kbd>
                  </div>
                </button>
              </Tooltip>
              <Tooltip
                content={TOOLTIPS_DICT.RECORD_IDE.CLEAR_SHELL}
                color="invert"
                placement="bottom"
              >
                <button
                  onClick={clearIde}
                  className="mr-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Clear
                </button>
              </Tooltip>
              <BricksIntegrator
                functionType="Function"
                forIde="X"
                preparedCode={(code) => {
                  setCode(code)
                }}
              />

              <a
                href="https://github.com/code-kern-ai/refinery-record-ide-env/blob/dev/requirements.txt"
                target="_blank"
                className="mx-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                See installed libraries
              </a>
            </div>
            {!loading && (
              <div
                className="font-dmMono ml-2 overflow-y-auto whitespace-pre-line text-xs"
                style={{
                  maxHeight: vertical
                    ? 'calc(100vh - 125px)'
                    : 'calc(50vh - 125px)',
                }}
              >
                <code>{output}</code>
              </div>
            )}
            {loading && (
              <div
                className="flex h-full items-center justify-center"
                style={{
                  height: vertical
                    ? 'calc(100vh - 150px)'
                    : 'calc(50vh - 150px)',
                }}
              >
                <LoadingIcon size="lg" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
