import UsersList from "@/src/components/users/UsersList"
import { setCurrentPage, setDisplayIconComments } from "@/src/reduxStore/states/general"
import { CurrentPage } from "@/submodules/react-components/hooks/web-socket/web-sockets-helper";
import { useEffect } from "react"
import { useDispatch } from "react-redux"

export default function Users() {

    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(setCurrentPage(CurrentPage.USERS));
        dispatch(setDisplayIconComments(false));
    }, [])

    return (
        <UsersList />
    )
}