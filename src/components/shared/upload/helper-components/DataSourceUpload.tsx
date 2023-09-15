import { useState } from "react";

export default function DataSourceUpload() {
    const [openTab, setOpenTab] = useState<number>(0);

    return (<div>
        <div className="text-gray-500 text-sm font-normal">Choose from one of the following data sources</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
                <label className={`rounded-lg relative border p-4 flex cursor-pointer h-full focus:outline-none bg-white ${openTab === 0 ? 'border-black' : 'border-gray'}`}
                    onClick={() => setOpenTab(0)} >
                    <input type="radio" name="upload-file" value={0} checked={true} onChange={() => { }}
                        className="h-4 w-4 mt-0.5 cursor-pointer shrink-0 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                        aria-labelledby="upload-file-0-label" aria-describedby="upload-file-0-description" />
                    <span className="ml-3 flex flex-col">
                        <span id="upload-file-1-label" className={`block text-sm font-medium ${openTab === 0 ? 'text-indigo-700' : 'text-gray-900'}`}> Upload file</span>
                        <span id="upload-file-1-description" className={`block text-sm font-normal ${openTab === 0 ? 'text-indigo-dark-2' : 'text-gray-500'}`}> Upload
                            any kind of CSV, JSON or spreadsheet. </span>
                    </span>
                </label>
            </div >
            <div>
                <label className="bg-white rounded-lg relative border p-4 flex h-full focus:outline-none">
                    <div className="grid grid-cols-6 gap-4 w-full">
                        <div className="col-span-3 lg:col-span-4 ml-3">
                            <span id="integrate-api-0-label" className="block text-sm font-medium text-gray-900">
                                Integrate via API </span>
                            <span id="integrate-api-0-description" className="block text-sm font-normal text-gray-500"> Upload
                                data
                                via our API. </span>
                        </div>
                        <div className="col-span-3 lg:col-span-2 text-right items-center flex">
                            <button
                                className="bg-gray-100 text-gray-800 rounded-lg text-xs px-2.5 py-0.5 cursor-default border border-gray-300">Coming
                                soon!</button>
                        </div>
                    </div>
                </label>
            </div>
            <div>
                <label className="bg-white rounded-lg relative border p-4 flex h-full focus:outline-none">
                    <div className="grid grid-cols-6 gap-4 w-full">
                        <div className="col-span-3 lg:col-span-4 ml-3">
                            <span id="integrate-database-0-label" className="block text-sm font-medium text-gray-900"> Integrate
                                database </span>
                            <span id="integrate-database-0-description" className="block text-sm font-normal text-gray-500">
                                Integrate data directly from a
                                DB. </span>
                        </div>
                        <div className="col-span-3 lg:col-span-2 text-right items-center flex">
                            <button
                                className="bg-gray-100 text-gray-800 rounded-lg text-xs px-2.5 py-0.5 cursor-default border border-gray-300">Coming
                                soon!</button>
                        </div>
                    </div>
                </label>
            </div>
        </div >
    </div>)
}