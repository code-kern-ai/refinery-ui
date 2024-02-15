import {
  selectBricksIntegrator,
  setBricksIntegrator,
} from '@/src/reduxStore/states/general'
import {
  IntegratorPage,
  PageInputExampleProps,
} from '@/src/types/shared/bricks-integrator'
import { jsonCopy } from '@/submodules/javascript-functions/general'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import LoadingIcon from '../loading/LoadingIcon'

export default function PageInputExample(props: PageInputExampleProps) {
  const dispatch = useDispatch()

  const config = useSelector(selectBricksIntegrator)

  const [inputData, setInputData] = useState('')

  useEffect(() => {
    if (!config.example.requestData) return
    setInputData(config.example.requestData)
  }, [config.example.requestData])

  return (
    <>
      {config && (
        <div
          className={`my-4 flex flex-col items-center justify-center gap-y-2 ${config.page != IntegratorPage.INPUT_EXAMPLE ? 'hidden' : ''}`}
        >
          <label>Input data:</label>
          <textarea
            value={inputData}
            className={`placeholder-italic line-height-textarea h-16 max-h-28 w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none`}
            onChange={(event: any) => {
              const target = event.target as HTMLTextAreaElement
              const finalHeight = target.scrollHeight + 2 // +2 for border
              const maxHeight = parseInt(
                window.getComputedStyle(target).getPropertyValue('max-height'),
              )
              target.style.height = `${finalHeight}px`
              target.style.overflowY =
                finalHeight < maxHeight ? 'hidden' : 'auto'
              const configCopy = jsonCopy(config)
              configCopy.example.requestData = target.value
              setInputData(target.value)
              dispatch(setBricksIntegrator(configCopy))
            }}
          >
            {inputData}
          </textarea>
          <div className="flex w-full flex-row items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setInputData(config.api.data.data.attributes.inputExample)
                const configCopy = jsonCopy(config)
                configCopy.example.returnData = null
                dispatch(setBricksIntegrator(configCopy))
              }}
              className="rounded-md border bg-indigo-700 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-800 focus:outline-none"
            >
              Reset to default
            </button>
            <button
              type="button"
              onClick={props.requestExample}
              className="rounded-md border bg-indigo-700 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-800 focus:outline-none"
            >
              Request example
            </button>
          </div>
          {config.example.requesting ? (
            <LoadingIcon />
          ) : (
            <>
              {config.example.returnData && (
                <textarea
                  disabled={true}
                  value={config.example.returnData}
                  onChange={() => {}}
                  className="textarea placeholder-italic line-height-textarea w-full border border-gray-300 bg-gray-200 p-2 focus:outline-none"
                >
                  {config.example.returnData}
                </textarea>
              )}
            </>
          )}
        </div>
      )}
    </>
  )
}
