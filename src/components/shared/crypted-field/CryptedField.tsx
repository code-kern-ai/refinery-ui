import { CryptoFieldProps } from "@/src/types/shared/crypted-field";
import { useDefaults } from "@/submodules/react-components/hooks/useDefaults";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { useRef, useState } from "react";

const DEFAULTS = {
    label: 'Password',
    placeholder: 'Enter some password here...',
    displayOptionalAsText: true,
    keyChange: (key: string) => { }
}

export default function CryptedField(_props: CryptoFieldProps) {
    const [key, setKey] = useState('');
    const [show, setShow] = useState(false);
    const [props] = useDefaults<CryptoFieldProps>(_props, DEFAULTS);

    const pwRef = useRef<HTMLInputElement>(null);

    function toggleKey() {
        setShow(!show);
    }

    return (
        <div className="form-control text-left">
            <label className="text-gray-500 text-sm font-medium m-1">
                {props.label} {props.displayOptionalAsText && <em>- optional</em>}
            </label>
            <div className="relative">
                <input type={show || key.length == 0 ? 'text' : 'password'} value={key} placeholder={props.placeholder} ref={pwRef}
                    className="h-8 w-full text-sm border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
                    onClick={() => show ? null : pwRef.current.type = 'password'} onInput={(e: any) => {
                        setKey(e.target.value);
                        props.keyChange(e.target.value);
                    }} />
                <button onClick={toggleKey} disabled={!key} className="disabled:cursor-not-allowed disabled:opacity-50">
                    {!show ? (
                        <IconEye className={`text-gray-500 absolute top-1 right-3 ${!key ? 'cursor-not-allowed opacity-50' : 'cursor-pointer opacity-100'}`} />
                    ) : (
                        <IconEyeOff className={`text-gray-500 absolute top-1 right-3 ${!key ? 'cursor-not-allowed opacity-50' : 'cursor-pointer opacity-100'}`} />
                    )}
                </button>
            </div>
        </div >
    );
}   