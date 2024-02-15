import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectIsAdmin,
  selectIsDemo,
  selectIsManaged,
  selectOrganization,
  setAllUsers,
  setIsAdmin,
  setIsDemo,
  setIsManaged,
  setOrganization,
  setRouteColor,
  setUser,
} from './states/general'
import { getUserAvatarUri } from '@/submodules/javascript-functions/general'
import { setActiveProject } from './states/project'
import {
  GET_ALL_TOKENIZER_OPTIONS,
  GET_PROJECT_BY_ID,
} from '../services/gql/queries/projects'
import { useLazyQuery } from '@apollo/client'
import {
  GET_ORGANIZATION,
  GET_ORGANIZATION_USERS,
  GET_USER_INFO,
} from '../services/gql/queries/organizations'
import {
  GET_IS_ADMIN,
  GET_VERSION_OVERVIEW,
} from '../services/gql/queries/config'
import { getIsDemo, getIsManaged } from '../services/base/data-fetch'
import { WebSocketsService } from '../services/base/web-sockets/WebSocketsService'
import { timer } from 'rxjs'
import { RouteManager } from '../services/base/route-manager'
import {
  GET_EMBEDDING_PLATFORMS,
  GET_RECOMMENDED_ENCODERS_FOR_EMBEDDINGS,
  GET_ZERO_SHOT_RECOMMENDATIONS,
} from '../services/gql/queries/project-setting'
import { CacheEnum, setCache } from './states/cachedValues'
import { postProcessingZeroShotEncoders } from '../util/components/models-downloaded/models-downloaded-helper'
import { checkWhitelistTokenizer } from '../util/components/projects/new-project/new-project-helper'
import { ConfigManager } from '../services/base/config'
import postprocessVersionOverview from '../util/shared/sidebar-helper'
import { postProcessingEmbeddingPlatforms } from '../util/components/projects/projectId/settings/embeddings-helper'
import { setDisplayUserRole } from './states/pages/labeling'

export function GlobalStoreDataComponent(props: React.PropsWithChildren) {
  const router = useRouter()
  const dispatch = useDispatch()

  const isManaged = useSelector(selectIsManaged)
  const isDemo = useSelector(selectIsDemo)
  const isAdmin = useSelector(selectIsAdmin)
  const organization = useSelector(selectOrganization)

  const [dataLoaded, setDataLoaded] = useState(false)

  const [getIsAdmin] = useLazyQuery(GET_IS_ADMIN, { fetchPolicy: 'no-cache' })
  const [refetchUserInfo] = useLazyQuery(GET_USER_INFO, {
    fetchPolicy: 'no-cache',
  })
  const [refetchProjectByProjectId] = useLazyQuery(GET_PROJECT_BY_ID, {
    fetchPolicy: 'no-cache',
  })
  const [refetchOrganization] = useLazyQuery(GET_ORGANIZATION, {
    fetchPolicy: 'no-cache',
  })
  const [refetchOrganizationUsers] = useLazyQuery(GET_ORGANIZATION_USERS, {
    fetchPolicy: 'no-cache',
  })
  const [refetchZeroShotRecommendations] = useLazyQuery(
    GET_ZERO_SHOT_RECOMMENDATIONS,
    { fetchPolicy: 'cache-first' },
  )
  const [refetchRecommendedEncoders] = useLazyQuery(
    GET_RECOMMENDED_ENCODERS_FOR_EMBEDDINGS,
    { fetchPolicy: 'cache-first' },
  )
  const [refetchTokenizerValues] = useLazyQuery(GET_ALL_TOKENIZER_OPTIONS, {
    fetchPolicy: 'cache-first',
  })
  const [refetchVersionOverview] = useLazyQuery(GET_VERSION_OVERVIEW, {
    fetchPolicy: 'no-cache',
  })
  const [refetchEmbeddingPlatforms] = useLazyQuery(GET_EMBEDDING_PLATFORMS, {
    fetchPolicy: 'cache-first',
  })

  useEffect(() => {
    getIsManaged((data) => {
      dispatch(setIsManaged(data))
    })
    getIsDemo((data) => {
      dispatch(setIsDemo(data))
    })
    getIsAdmin().then((data) => {
      dispatch(setIsAdmin(data.data.isAdmin))
    })
    refetchUserInfo().then((res) => {
      const userInfo = { ...res.data['userInfo'] }
      userInfo.avatarUri = getUserAvatarUri(res.data['userInfo'])
      dispatch(setUser(userInfo))
      dispatch(setDisplayUserRole(res.data['userInfo'].role))
    })
    refetchOrganization().then((res) => {
      if (res.data['userOrganization']) {
        if (WebSocketsService.getConnectionOpened()) return
        WebSocketsService.setConnectionOpened(true)
        WebSocketsService.initWsNotifications()
        setDataLoaded(true)
        dispatch(setOrganization(res.data['userOrganization']))
      } else {
        dispatch(setOrganization(null))
        timer(60000).subscribe(() => location.reload())
      }
    })
    refetchOrganizationUsers().then((res) => {
      dispatch(setAllUsers(res.data['allUsers']))
    })

    // Set cache
    refetchZeroShotRecommendations().then((resZeroShot) => {
      dispatch(
        setCache(
          CacheEnum.ZERO_SHOT_RECOMMENDATIONS,
          JSON.parse(resZeroShot.data['zeroShotRecommendations']),
        ),
      )
      refetchRecommendedEncoders().then((resEncoders) => {
        dispatch(
          setCache(
            CacheEnum.MODELS_LIST,
            postProcessingZeroShotEncoders(
              JSON.parse(resZeroShot.data['zeroShotRecommendations']),
              resEncoders.data['recommendedEncoders'],
            ),
          ),
        )
      })
    })
    refetchVersionOverview().then((res) => {
      dispatch(
        setCache(
          CacheEnum.VERSION_OVERVIEW,
          postprocessVersionOverview(res.data['versionOverview']),
        ),
      )
    })
    refetchEmbeddingPlatforms().then((res) => {
      dispatch(
        setCache(
          CacheEnum.EMBEDDING_PLATFORMS,
          postProcessingEmbeddingPlatforms(
            res.data['embeddingPlatforms'],
            organization,
          ),
        ),
      )
    })
  }, [])

  useEffect(() => {
    const routeColor = RouteManager.checkRouteHighlight(router.asPath)
    dispatch(setRouteColor(routeColor))
    const something = (url: any) => {
      const routeColor = RouteManager.checkRouteHighlight(url)
      dispatch(setRouteColor(routeColor))
    }
    router.events.on('routeChangeComplete', something)
    return () => {
      router.events.off('routeChangeComplete', something)
    }
  }, [])

  useEffect(() => {
    if (isManaged == null || isDemo == null || isAdmin == null) return
    setDataLoaded(true)
  }, [isManaged, isDemo, isAdmin])

  useEffect(() => {
    const projectId = router.query.projectId as string
    if (projectId) {
      refetchProjectByProjectId({ variables: { projectId: projectId } }).then(
        (res) => {
          dispatch(setActiveProject(res.data['projectByProjectId']))
        },
      )
    } else {
      dispatch(setActiveProject(null))
    }
  }, [router.query.projectId])

  useEffect(() => {
    if (!ConfigManager.isInit()) return
    refetchTokenizerValues().then((res) => {
      dispatch(
        setCache(
          CacheEnum.TOKENIZER_VALUES,
          checkWhitelistTokenizer(res.data['languageModels'], isManaged),
        ),
      )
    })
  }, [ConfigManager.isInit(), isManaged])

  if (!dataLoaded) return <></>
  return <div>{props.children}</div>
}
