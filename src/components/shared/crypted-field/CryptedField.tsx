import { CryptoFieldProps } from '@/src/types/shared/crypted-field'
import { TOOLTIPS_DICT } from '@/src/util/tooltip-constants'
import { useDefaults } from '@/submodules/react-components/hooks/useDefaults'
import { Tooltip } from '@nextui-org/react'
import { IconEye, IconEyeOff } from '@tabler/icons-react'
import { useRef, useState } from 'react'

const DEFAULTS = {
  label: 'Password',
  placeholder: 'Enter some password here...',
  displayOptionalAsText: true,
  keyChange: (key: string) => {},
}

export default function CryptedField(_props: CryptoFieldProps) {
  const [key, setKey] = useState('')
  const [show, setShow] = useState(false)
  const [props] = useDefaults<CryptoFieldProps>(_props, DEFAULTS)

  const pwRef = useRef<HTMLInputElement>(null)

  function toggleKey() {
    setShow(!show)
  }

  return (
    <div className="form-control text-left">
      <label className="m-1 text-sm font-medium text-gray-500">
        {props.label} {props.displayOptionalAsText && <em>- optional</em>}
      </label>
      <div className="relative">
        <input
          type={show || key.length == 0 ? 'text' : 'password'}
          value={key}
          placeholder={props.placeholder}
          ref={pwRef}
          className="placeholder-italic h-8 w-full rounded-md border border-gray-300 pl-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
          onClick={() => (show ? null : (pwRef.current.type = 'password'))}
          onInput={(e: any) => {
            setKey(e.target.value)
            props.keyChange(e.target.value)
          }}
        />
        <button
          onClick={toggleKey}
          disabled={!key}
          className="disabled:cursor-not-allowed disabled:opacity-50"
        >
          {!show ? (
            <Tooltip
              content={TOOLTIPS_DICT.GENERAL.SHOW_PASSWORD}
              color="invert"
              placement="right"
            >
              <IconEye
                className={`absolute right-3 top-1 text-gray-500 ${!key ? 'cursor-not-allowed opacity-50' : 'cursor-pointer opacity-100'}`}
              />
            </Tooltip>
          ) : (
            <Tooltip
              content={TOOLTIPS_DICT.GENERAL.HIDE_PASSWORD}
              color="invert"
              placement="right"
            >
              <IconEyeOff
                className={`absolute right-3 top-1 text-gray-500 ${!key ? 'cursor-not-allowed opacity-50' : 'cursor-pointer opacity-100'}`}
              />
            </Tooltip>
          )}
        </button>
      </div>
    </div>
  )
}
