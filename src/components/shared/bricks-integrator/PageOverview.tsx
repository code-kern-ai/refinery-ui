import {
  selectBricksIntegrator,
  setBricksIntegrator,
} from '@/src/reduxStore/states/general'
import {
  IntegratorPage,
  PageOverviewProps,
} from '@/src/types/shared/bricks-integrator'
import { useDispatch, useSelector } from 'react-redux'
import LoadingIcon from '../loading/LoadingIcon'
import { IconChevronsDown } from '@tabler/icons-react'
import style from '@/src/styles/shared/bricks-integrator.module.css'
import { BricksCodeParser } from '@/src/util/classes/bricks-integrator/bricks-integrator'
import { Tooltip } from '@nextui-org/react'
import { TOOLTIPS_DICT } from '@/src/util/tooltip-constants'
import { copyToClipboard } from '@/submodules/javascript-functions/general'
import { useState } from 'react'

export default function PageOverview(props: PageOverviewProps) {
  const dispatch = useDispatch()

  const config = useSelector(selectBricksIntegrator)

  const [codeTester, setCodeTester] = useState('')

  return (
    <>
      {config && (
        <div
          className={`my-4 flex flex-col items-center justify-center gap-y-2 text-left ${config.page != IntegratorPage.OVERVIEW ? 'hidden' : ''}`}
        >
          {config.api.requesting ? (
            <LoadingIcon />
          ) : (
            <>
              {config.api.data && config.api.moduleId >= 0 && (
                <>
                  {config.extendedIntegrator ? (
                    <div
                      className="grid grid-cols-2  items-center gap-x-2 gap-y-2"
                      style={{ gridTemplateColumns: 'max-content max-content' }}
                    >
                      <div className="font-bold">Module Name</div>
                      <label>{config.api.data.data.attributes.name}</label>
                      <div className="font-bold">Description</div>
                      <label style={{ maxWidth: '25rem' }}>
                        {config.api.data.data.attributes.description}
                      </label>
                      <div className="font-bold">Bricks Link</div>
                      <a
                        href={config.api.data.data.attributes.bricksLink}
                        target="_blank"
                      >
                        <span className="cursor-pointer underline">
                          {config.api.data.data.attributes.name}
                        </span>
                      </a>
                      <div className="col-span-full col-start-1">
                        <div
                          className="flex cursor-pointer flex-row items-center justify-between"
                          onClick={() => {
                            const configCopy = { ...config }
                            configCopy.extendedIntegratorOverviewAddInfoOpen =
                              !configCopy.extendedIntegratorOverviewAddInfoOpen
                            dispatch(setBricksIntegrator(configCopy))
                          }}
                        >
                          <label className="cursor-pointer text-base font-bold text-gray-900 underline">
                            Details
                          </label>
                          <IconChevronsDown
                            className={`h-6 w-6 ${config.extendedIntegratorOverviewAddInfoOpen ? style.rotateTransform : null}`}
                          />
                        </div>
                      </div>
                      <div
                        className={`contents ${config.extendedIntegratorOverviewAddInfoOpen ? '' : 'hidden'}`}
                      >
                        <div className="font-bold">Github Issue Link</div>
                        <a
                          href={config.api.data.data.attributes.issueLink}
                          target="_blank"
                        >
                          <span className="cursor-pointer underline">
                            #{config.api.data.data.attributes.issueId}
                          </span>
                        </a>
                        <div className="font-bold">Min Refinery Version</div>
                        <label>
                          {config.api.data.data.attributes.minRefineryVersion}
                        </label>
                        <div className="font-bold">Grouping</div>
                        <label>
                          {config.api.data.data.attributes.partOfGroupText}
                        </label>
                        <div className="font-bold">Execution Type</div>
                        <label>
                          {config.api.data.data.attributes.executionType}
                        </label>
                        <div className="font-bold">Module Type</div>
                        <label>
                          {config.api.data.data.attributes.moduleType}
                        </label>
                        <div className="font-bold">Data Type</div>
                        <label>
                          {
                            config.api.data.data.attributes.integratorInputs
                              ?.refineryDataType
                          }
                        </label>
                      </div>
                      <div className="col-span-full col-start-1">
                        <div
                          className="flex cursor-pointer flex-row items-center justify-between"
                          onClick={() => {
                            const configCopy = { ...config }
                            configCopy.overviewCodeOpen =
                              !configCopy.overviewCodeOpen
                            dispatch(setBricksIntegrator(configCopy))
                          }}
                        >
                          <label className="cursor-pointer text-base font-bold text-gray-900">
                            <span className="underline">Source Code</span>
                            <span className="text-sm font-normal">
                              &nbsp;(guided integration through tab integration)
                            </span>
                          </label>
                          <IconChevronsDown
                            className={`h-6 w-6 ${config.overviewCodeOpen ? style.rotateTransform : null}`}
                          />
                        </div>
                        <div
                          className={`mt-1 flex flex-col items-center ${config.overviewCodeOpen ? '' : 'hidden'}`}
                        >
                          <div
                            className="overflow-y-auto"
                            style={{ maxHeight: '15rem', maxWidth: '35rem' }}
                          >
                            <pre
                              className={`${style.editorPre}`}
                              style={{
                                overflowX: config.overviewCodeOpen
                                  ? 'auto'
                                  : 'hidden',
                              }}
                            >
                              {BricksCodeParser.baseCode}
                            </pre>
                          </div>
                          <Tooltip
                            content={
                              config.copied
                                ? TOOLTIPS_DICT.GENERAL.COPIED
                                : TOOLTIPS_DICT.GENERAL.CLICK_TO_COPY
                            }
                            color="invert"
                            placement="top"
                            className="mt-2"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                copyToClipboard(BricksCodeParser.baseCode)
                              }
                              className="rounded-md border bg-indigo-700 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-800 focus:outline-none"
                            >
                              Copy
                            </button>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="grid grid-cols-2 items-center gap-x-2 gap-y-2"
                      style={{ gridTemplateColumns: 'max-content max-content' }}
                    >
                      <div className="font-bold">Module Id</div>
                      <label>{config.api.data.data.id}</label>
                      <div className="font-bold">Module Name</div>
                      <label>{config.api.data.data.attributes.name}</label>
                      <div className="font-bold">Description</div>
                      <label style={{ maxWidth: '25rem' }}>
                        {config.api.data.data.attributes.description}
                      </label>
                      <div className="font-bold">Execution Type</div>
                      <label>
                        {config.api.data.data.attributes.executionType}
                      </label>
                      <div className="font-bold">Module Type</div>
                      <label>
                        {config.api.data.data.attributes.moduleType}
                      </label>
                      <div className="font-bold">Link</div>
                      <a
                        href={config.api.data.data.attributes.link}
                        target="_blank"
                      >
                        <span className="cursor-pointer underline">
                          {config.api.data.data.attributes.name}
                        </span>
                      </a>
                      <div className="col-span-full col-start-1">
                        <div
                          className="flex cursor-pointer flex-row items-center justify-between"
                          onClick={() => {
                            const configCopy = { ...config }
                            configCopy.overviewCodeOpen =
                              !configCopy.overviewCodeOpen
                            dispatch(setBricksIntegrator(configCopy))
                          }}
                        >
                          <label className="cursor-pointer text-base font-bold text-gray-900">
                            <span className="underline">Source Code</span>
                            <span className="text-sm font-normal">
                              &nbsp;(guided integration through tabvintegration)
                            </span>
                          </label>
                          <IconChevronsDown
                            className={`h-6 w-6 ${config.overviewCodeOpen ? style.rotateTransform : null}`}
                          />
                        </div>
                        <div
                          className={`mt-1 flex flex-col items-center ${config.overviewCodeOpen ? '' : 'hidden'}`}
                        >
                          <div
                            className="overflow-y-auto"
                            style={{ maxHeight: '15rem', maxWidth: '35rem' }}
                          >
                            <pre
                              className={`${style.editorPre}`}
                              style={{
                                overflowX: config.overviewCodeOpen
                                  ? 'auto'
                                  : 'hidden',
                              }}
                            >
                              {BricksCodeParser.baseCode}
                            </pre>
                          </div>
                          <Tooltip
                            content={
                              config.copied
                                ? TOOLTIPS_DICT.GENERAL.COPIED
                                : TOOLTIPS_DICT.GENERAL.CLICK_TO_COPY
                            }
                            color="invert"
                            placement="top"
                            className="mt-2"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                copyToClipboard(BricksCodeParser.baseCode)
                              }
                              className="rounded-md border bg-indigo-700 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-800 focus:outline-none"
                            >
                              Copy
                            </button>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              {config.api.moduleId < 0 && (
                <textarea
                  value={codeTester}
                  onChange={(e) => {
                    setCodeTester(e.target.value)
                    props.setCodeTester(e.target.value)
                  }}
                  className="placeholder-italic line-height-textarea h-20 w-full border border-gray-300 p-2 focus:outline-none"
                  placeholder="Example Module Code"
                  style={{
                    width: 'min(80vw,600px)',
                    height: 'min(80vh,600px)',
                  }}
                >
                  {config.api.data.data.attributes.sourceCode}
                </textarea>
              )}
            </>
          )}
        </div>
      )}
    </>
  )
}
