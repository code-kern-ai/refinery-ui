import { CryptoFieldProps } from "@/src/types/shared/crypted-field";
import { useRef, useState } from "react";

export default function CryptedField({ label = 'Password', placeholder = 'Enter some password here...', displayOptionalAsText = true }, props: CryptoFieldProps) {
    const [key, setKey] = useState<string>('');
    const [show, setShow] = useState<boolean>(false);

    const pwRef = useRef<HTMLInputElement>(null);

    function toggleKey() {
        setShow(!show);
    }

    return (
        <div className="form-control">
            <label className="text-gray-500 text-sm font-medium m-1">
                {label} {displayOptionalAsText && <em>- optional</em>}
            </label>
            <div className="relative">
                <input type={show || key.length == 0 ? 'text' : 'password'} value={key} placeholder={placeholder} ref={pwRef}
                    className="h-8 w-full border-gray-300 rounded-md placeholder-italic border text-gray-900 pl-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-gray-100"
                    onClick={() => show ? null : pwRef.current.type = 'password'} onInput={(e: any) => {
                        setKey(e.target.value);
                        props.keyChange(e.target.value);
                    }} />
                <button onClick={toggleKey} disabled={!key}>
                    {!show ? (
                        <svg xmlns="http://www.w3.org/2000/svg"
                            className={`icon icon-tabler icon-tabler-eye text-gray-500 absolute top-1 right-3 cursor-pointer ${!key ? 'cursor-not-allowed opacity-50' : 'cursor-pointer opacity-100'}`}
                            width="24" height="24" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none"
                            strokeLinecap="round" strokeLinejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                            <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg"
                            className={`icon icon-tabler icon-tabler-eye-off text-gray-500 absolute top-1 right-3 ${!key ? 'cursor-not-allowed opacity-50' : 'cursor-pointer opacity-100'}`}
                            width="24" height="24" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none"
                            strokeLinecap="round" strokeLinejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M10.585 10.587a2 2 0 0 0 2.829 2.828" />
                            <path
                                d="M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87" />
                            <path d="M3 3l18 18" />
                        </svg>
                    )}
                </button>
            </div>
        </div >
    );
}   