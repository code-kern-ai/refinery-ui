import {
  selectBricksIntegrator,
  setBricksIntegrator,
} from '@/src/reduxStore/states/general'
import {
  IntegratorPage,
  PageSearchProps,
} from '@/src/types/shared/bricks-integrator'
import {
  IconAlertCircle,
  IconBrandGithub,
  IconChevronsDown,
  IconLoader,
  IconSearch,
} from '@tabler/icons-react'
import { useDispatch, useSelector } from 'react-redux'
import LoadingIcon from '../loading/LoadingIcon'
import { useState } from 'react'
import style from '@/src/styles/shared/bricks-integrator.module.css'
import { jsonCopy } from '@/submodules/javascript-functions/general'
import * as TablerIcons from '@tabler/icons-react'
import { getIconName } from '@/src/util/shared/bricks-integrator-helper'

export default function PageSearch(props: PageSearchProps) {
  const dispatch = useDispatch()

  const config = useSelector(selectBricksIntegrator)

  const [searchValue, setSearchValue] = useState<string>('')

  return (
    <>
      {config && (
        <div
          className={`mx-auto my-4 flex flex-col items-center gap-y-2 ${config.page != IntegratorPage.SEARCH ? 'hidden' : ''} `}
          style={{ height: '28rem', width: '32rem' }}
        >
          <div className="flex w-full max-w-xl transform flex-col divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl transition-all">
            {/* normal search box */}
            <div className="relative">
              <IconSearch className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                style={{ outline: 'none', boxShadow: 'none' }}
                placeholder="Search..."
                className="placeholder-italic bg-transparent h-12 w-full rounded-md border-0  border-gray-300 pl-11 pr-4 text-sm text-gray-800 placeholder-gray-400 outline-none placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
                value={searchValue}
                autoComplete="off"
                onInput={(e: any) => {
                  setSearchValue(e.target.value)
                  props.requestSearchDebounce(e.target.value)
                }}
              />
              {config.search.requesting && (
                <div className="absolute right-0 top-3">
                  <LoadingIcon />
                </div>
              )}
            </div>
            {/* extendedIntegrator group filtering */}
            {config.extendedIntegrator && (
              <div className="w-full px-4">
                <div
                  className="mt-1 flex w-full cursor-pointer flex-row items-center justify-between"
                  onClick={() => {
                    const configCopy = jsonCopy(config)
                    configCopy.extendedIntegratorGroupFilterOpen =
                      !configCopy.extendedIntegratorGroupFilterOpen
                    dispatch(setBricksIntegrator(configCopy))
                  }}
                >
                  <label className="cursor-pointer text-base font-bold text-gray-900">
                    Group Filter
                  </label>
                  <IconChevronsDown
                    className={`h-6 w-6 ${config.extendedIntegratorGroupFilterOpen ? style.rotateTransform : null}`}
                  />
                </div>
                <div
                  className={`my-2 flex w-full flex-col ${config.extendedIntegratorGroupFilterOpen ? '' : 'hidden'}`}
                >
                  <div className="flex w-full flex-row flex-wrap gap-x-2 gap-y-2">
                    {config.groupFilterOptions.filterValuesArray.map(
                      (filterValue: any, i: number) => (
                        <div
                          key={filterValue.key}
                          className="flex cursor-pointer flex-row items-center gap-x-1"
                          onClick={() => props.setGroupActive(filterValue.key)}
                        >
                          <input
                            type="radio"
                            checked={filterValue.active}
                            onChange={() =>
                              props.setGroupActive(filterValue.key)
                            }
                            name={
                              filterValue.name +
                              ' (' +
                              filterValue.countInGroup +
                              ')'
                            }
                            className="h-4 w-4 cursor-pointer border-gray-200 text-blue-600 focus:ring-blue-500"
                          />
                          <label
                            htmlFor={
                              filterValue.name +
                              ' (' +
                              filterValue.countInGroup +
                              ')'
                            }
                            className="cursor-pointer text-sm font-bold text-gray-900"
                          >
                            {filterValue.name +
                              ' (' +
                              filterValue.countInGroup +
                              ')'}
                          </label>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            )}
            {/* Empty state, show/hide based on command palette state */}
            {config.search.nothingMatches ? (
              <div className="px-6 py-6 text-center text-sm">
                <IconAlertCircle className="mx-auto h-6 w-6 text-gray-400" />
                {config.search.requesting ? (
                  <>
                    <p className="mt-4 font-semibold text-gray-900">
                      No preliminary results found
                    </p>
                    <p className="mt-2 text-gray-500">
                      We also query the backend to provide you with a more
                      sophisticated similarity search.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mt-2 font-semibold text-gray-900">
                      No results found
                    </p>
                    <p className="mt-2 text-gray-500">
                      No components found for this search term.
                    </p>
                    <p className="mt-6 text-sm text-gray-500">
                      Feel free to open an issue on GitHub if you think we
                      should add it.
                    </p>
                    <a
                      href="https://github.com/code-kern-ai/bricks/issues"
                      target="_blank"
                      rel="noopener noreferrer"
                      type="button"
                      className="mt-2 inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
                    >
                      <IconBrandGithub className="h-6 w-6 text-gray-900" />
                      Open an issue on GitHub
                    </a>
                  </>
                )}
              </div>
            ) : (
              <ul
                className="max-h-96 scroll-py-3 overflow-y-auto p-3"
                style={{ maxHeight: '24rem' }}
                id="options"
                role="listbox"
              >
                {config.search.results.map((result: any, i: number) => (
                  <li
                    key={result.id}
                    onClick={() => props.selectSearchResult(result.id)}
                    className={`group relative flex cursor-pointer select-none flex-row items-center rounded-xl p-3 text-left hover:bg-gray-100 ${!result.searchVisible || !result.groupVisible ? 'hidden' : ''}`}
                    id="option-1"
                    role="option"
                  >
                    <SVGIcon
                      icon={result.attributes.tablerIcon}
                      size={24}
                      strokeWidth={2}
                      color={'black'}
                    />
                    <div className="ml-2 flex-auto">
                      <p className="text-sm font-bold text-gray-700">
                        {result.attributes.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {result.attributes.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  )
}

function SVGIcon({ icon, size, strokeWidth, color }) {
  const Icon = TablerIcons['Icon' + icon]
  if (Icon) {
    return <Icon size={size} strokeWidth={strokeWidth} color={color} />
  } else {
    const Icon = TablerIcons['Icon' + getIconName(icon)]
    if (Icon) {
      return <Icon size={size} strokeWidth={strokeWidth} color={color} />
    }
  }
}
