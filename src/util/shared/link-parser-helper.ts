export function buildFullLink(route: string) {
  return (
    window.location.protocol + '//' + window.location.host + '/refinery' + route
  )
}

export function parseLinkFromText(link: string) {
  if (!link) return null
  let linkData: any = {
    protocol: window.location.protocol,
    host: window.location.host,
    inputLink: '' + link,
    queryParams: {},
  }
  if (link.startsWith(linkData.protocol))
    link = link.substring(linkData.protocol.length)
  if (link.startsWith('//')) link = link.substring(2)
  if (link.startsWith(linkData.host))
    link = link.substring(linkData.host.length)
  if (link.startsWith('/refinery')) link = link.substring(9)
  if (link.indexOf('?') > -1) {
    let params = link.split('?')
    linkData.route = params[0]
    params = params[1].split('&')
    params.forEach((param) => {
      let keyValue = param.split('=')
      linkData.queryParams[keyValue[0]] = keyValue[1]
    })
  } else {
    linkData.route = link
  }

  linkData.fullUrl =
    linkData.protocol + '//' + linkData.host + '/refinery' + linkData.route
  if (linkData.queryParams)
    linkData.fullUrl +=
      '?' +
      Object.keys(linkData.queryParams)
        .map((key) => key + '=' + linkData.queryParams[key])
        .join('&')

  return linkData
}
