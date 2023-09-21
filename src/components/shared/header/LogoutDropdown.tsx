import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { useSelector } from 'react-redux'
import { selectIsManaged, selectUser } from '@/src/reduxStore/states/general'
import { useRouter } from 'next/router'
import { logoutUser } from '@/src/services/base/user-management/data-fetch'


export default function LogoutDropdown() {
    const router = useRouter();
    const isManaged = useSelector(selectIsManaged);
    const user = useSelector(selectUser);

    function classNames(...classes) {
        return classes.filter(Boolean).join(' ')
    }

    return (
        <Menu as="div" className="relative inline-block text-left">
            <div>
                <Menu.Button className="flex items-center rounded-full bg-gray-100 text-gray-400 hover:text-gray-600 focus:outline-none mr-4">
                    <img className="h-8 w-8 rounded-full" src={`/refinery/avatars/${user?.avatarUri}`} />
                </Menu.Button>
            </div>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                        <Menu.Item>
                            {({ active }) => (
                                <a onClick={() => window.open('/auth/settings', '_blank')}
                                    className={classNames(
                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                        'block px-4 py-2 text-sm cursor-pointer'
                                    )}
                                >
                                    Account settings
                                </a>
                            )}
                        </Menu.Item>
                        {!isManaged && <Menu.Item>
                            {({ active }) => (
                                <a onClick={() => router.push('/config')}
                                    className={classNames(
                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                        'block px-4 py-2 text-sm cursor-pointer'
                                    )}
                                >
                                    Config
                                </a>
                            )}
                        </Menu.Item>}
                        <Menu.Item>
                            {({ active }) => (
                                <a onClick={logoutUser}
                                    className={classNames(
                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                        'block px-4 py-2 text-sm cursor-pointer'
                                    )}
                                >
                                    Logout
                                </a>
                            )}
                        </Menu.Item>
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    )
}