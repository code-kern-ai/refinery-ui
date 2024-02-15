import {
  FetchType,
  jsonFetchWrapper,
} from '@/submodules/javascript-functions/basic-fetch'

const logoutUr = '/.ory/kratos/public/self-service/logout/browser'

export function getIsManaged(onResult: (result: any) => void) {
  const url = `/is_managed`
  jsonFetchWrapper(url, FetchType.GET, onResult)
}

export function getIsDemo(onResult: (result: any) => void) {
  const url = `/is_demo`
  jsonFetchWrapper(url, FetchType.GET, onResult)
}

export function logoutUser() {
  fetch(logoutUr)
    .then((response) => response.json())
    .then((data) => {
      window.location.href = data['logout_url']
    })
}

export function getBricksIntegrator(
  url: string,
  headers: any,
  onResult: (result: any) => void,
  onError?: (response: any) => void,
) {
  jsonFetchWrapper(url, FetchType.GET, onResult, null, headers, onError)
}

export function postBricksIntegrator(
  url: string,
  headers: any,
  body: any,
  onResult: (result: any) => void,
  onError?: (response: any) => void,
) {
  jsonFetchWrapper(url, FetchType.POST, onResult, body, headers, onError)
}
