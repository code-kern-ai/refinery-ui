const logoutUr = '/.ory/kratos/public/self-service/logout/browser';


export function logoutUser() {
    fetch(logoutUr)
        .then((response) => response.json())
        .then((data) => {
            window.location.href = data["logout_url"]
        })
}
