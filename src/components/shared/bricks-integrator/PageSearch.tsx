import { selectBricksIntegrator, setBricksIntegrator } from "@/src/reduxStore/states/general";
import { IntegratorPage, PageSearchProps } from "@/src/types/shared/bricks-integrator";
import { IconAlertCircle, IconBrandGithub, IconChevronsDown, IconSearch } from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux"
import LoadingIcon from "../loading/LoadingIcon";
import { useState } from "react";
import style from '@/src/styles/shared/bricks-integrator.module.css';
import { jsonCopy } from "@/submodules/javascript-functions/general";
export default function PageSearch(props: PageSearchProps) {
    const dispatch = useDispatch();

    const config = useSelector(selectBricksIntegrator);

    const [searchValue, setSearchValue] = useState<string>('');

    return (<>
        {config && <div className={`flex flex-col gap-y-2 items-center my-4 mx-auto ${config.page != IntegratorPage.SEARCH ? 'hidden' : ''} `} style={{ height: '28rem', width: '32rem' }}>
            <div className="flex flex-col w-full max-w-xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl transition-all">
                {/* normal search box */}
                <div className="relative">
                    <IconSearch className="pointer-events-none absolute top-3.5 left-4 h-5 w-5 text-gray-400" />
                    <input type="text" style={{ outline: 'none', boxShadow: 'none' }} placeholder="Search..."
                        className="h-12 w-full text-sm border-gray-300 rounded-md placeholder-italic  border-0 bg-transparent pl-11 pr-4 text-gray-800 placeholder-gray-400 outline-none placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
                        value={searchValue} autoComplete="off"
                        onInput={(e: any) => {
                            setSearchValue(e.target.value);
                            props.requestSearchDebounce(e.target.value);
                        }} />
                    {config.search.requesting && <div className="absolute right-0 top-3"><LoadingIcon /></div>}
                </div>
                {/* extendedIntegrator group filtering */}
                {config.extendedIntegrator && <div className="w-full px-4">
                    <div className="flex flex-row justify-between cursor-pointer items-center w-full mt-1" onClick={() => {
                        const configCopy = jsonCopy(config);
                        configCopy.extendedIntegratorGroupFilterOpen = !configCopy.extendedIntegratorGroupFilterOpen;
                        dispatch(setBricksIntegrator(configCopy));
                    }}>
                        <label className="text-base font-semibold text-gray-900 cursor-pointer">Group Filter</label>
                        <IconChevronsDown className={`w-6 h-6 ${config.extendedIntegratorGroupFilterOpen ? style.rotateTransform : null}`} />
                    </div>
                    <div className={`flex flex-col w-full my-2 ${config.extendedIntegratorGroupFilterOpen ? '' : 'hidden'}`}>
                        <div className="flex flex-row flex-wrap w-full gap-x-2 gap-y-2">
                            {config.groupFilterOptions.filterValuesArray.map((filterValue: any, i: number) => (
                                <div key={filterValue.key} className="flex flex-row gap-x-1 cursor-pointer items-center" onClick={() => props.setGroupActive(filterValue.key)}>
                                    <input type="radio" checked={filterValue.active} onChange={() => props.setGroupActive(filterValue.key)} name={filterValue.name + ' (' + filterValue.countInGroup + ')'}
                                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-200 cursor-pointer" />
                                    <label htmlFor={filterValue.name + ' (' + filterValue.countInGroup + ')'}
                                        className="text-sm font-semibold text-gray-900 cursor-pointer">{filterValue.name + ' (' + filterValue.countInGroup + ')'}</label>
                                </div>))}
                        </div>
                    </div>
                </div>}
                {/* Empty state, show/hide based on command palette state */}
                {config.search.nothingMatches ? (<div className="py-6 px-6 text-center text-sm">
                    <IconAlertCircle className="mx-auto h-6 w-6 text-gray-400" />
                    {config.search.requesting ? (<>
                        <p className="mt-4 font-semibold text-gray-900">No preliminary results found</p>
                        <p className="mt-2 text-gray-500">We also query the backend to provide you with a more sophisticated similarity search.</p>
                    </>) : (<>
                        <p className="mt-2 font-semibold text-gray-900">No results found</p>
                        <p className="mt-2 text-gray-500">No components found for this search term.</p>
                        <p className="mt-6 text-sm text-gray-500">Feel free to open an issue on GitHub if you think we should add it.</p>
                        <a href="https://github.com/code-kern-ai/bricks/issues" target="_blank"
                            rel="noopener noreferrer" type="button"
                            className="mt-2 inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none">
                            <IconBrandGithub className="h-6 w-6 text-gray-900" />Open an issue on GitHub</a>
                    </>)}
                </div>) : (<ul className="max-h-96 scroll-py-3 overflow-y-auto p-3" style={{ maxHeight: '24rem' }} id="options" role="listbox">
                    {config.search.results.map((result: any, i: number) => (
                        <li key={result.id} onClick={() => props.selectSearchResult(result.id)}
                            className={`text-left group flex flex-row items-center cursor-pointer select-none rounded-xl p-3 hover:bg-gray-100 relative ${!result.searchVisible || !result.groupVisible ? 'hidden' : ''}`} id="option-1" role="option">
                            <div className="ml-2 flex-auto">
                                <p className="text-sm font-semibold text-gray-700">{result.attributes.name}</p>
                                <p className="text-sm text-gray-500">{result.attributes.description}</p>
                            </div>
                        </li>))}
                </ul>)}
            </div>
        </div>}
    </>)
}
