export default function Logs({ logs }: { logs: string[] }) {
  return (
    <div className="mt-2 flex-grow border bg-white">
      <div
        className="card-body overflow-auto p-3"
        style={{ maxHeight: '500px' }}
      >
        {logs && logs.length != 0 ? (
          <pre className="text-indigo-dark-1 text-sm">{logs.join('\n')}</pre>
        ) : (
          <div className="text-sm font-normal leading-5 text-gray-500">
            Run module to display logs
          </div>
        )}
      </div>
    </div>
  )
}
