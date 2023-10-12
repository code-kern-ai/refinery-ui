export default function Logs({ logs }: { logs: string[] }) {

    return (<div className="border bg-white flex-grow mt-2">
        <div className="card-body p-3 overflow-auto" style={{ maxHeight: '500px' }}>
            {logs && logs.length != 0
                ? (<pre className="text-sm text-indigo-dark-1">{logs.join("\n")}</pre>)
                : (<div className="text-sm leading-5 font-normal text-gray-500" >Run module to display logs</div>)}
        </div>
    </div >)
}