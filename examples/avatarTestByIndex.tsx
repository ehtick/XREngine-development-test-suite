import React, { useEffect } from 'react'

import { LoadingCircle } from '@etherealengine/client-core/src/components/LoadingCircle'
import { EngineState, useEngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { EngineActions } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { matchActionOnce } from '@etherealengine/engine/src/networking/functions/matchActionOnce'
import { dispatchAction, getMutableState } from '@etherealengine/hyperflux'
import { AvatarService, AvatarState } from '@etherealengine/client-core/src/user/services/AvatarService'
import { mockNetworkAvatars, mockAnimAvatars, mockTPoseAvatars, mockIKAvatars } from './utils/loadAvatarHelpers'
import { LocationIcons } from '@etherealengine/client-core/src/components/LocationIcons'
import { useSimulateMovement } from './utils/simulateMovement'
import { useOfflineScene, useLoadEngineWithScene } from '@etherealengine/client-core/src/components/World/EngineHooks'
import { DefaultLocationSystems } from '@etherealengine/client-core/src/world/DefaultLocationSystems'

export default function AvatarBenchmarking() {
  const engineState = useEngineState()

  const projectName = 'default-project'
  const sceneName = 'default'

  useEffect(() => {
    getMutableState(EngineState).avatarLoadingEffect.set(false)
    AvatarService.fetchAvatarList()
    matchActionOnce(EngineActions.joinedWorld.matches, mockAvatars)
  }, [])

  useOfflineScene({ projectName, sceneName, spectate: true })
  useLoadEngineWithScene({ injectedSystems: DefaultLocationSystems, spectate: true })
  useSimulateMovement()

  const mockAvatars = () => {
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    const indexStr = urlParams.get('index') as any
    const index = parseInt(indexStr) | 0

    const avatars = getMutableState(AvatarState).avatarList.value
    mockNetworkAvatars([avatars[index]])
    mockIKAvatars([avatars[index]])
    mockAnimAvatars([avatars[index]])
    mockTPoseAvatars([avatars[index]])
  }

  return (
    <>
      {engineState.isEngineInitialized.value ? <></> : <LoadingCircle />}
      <LocationIcons />
    </>
  )
}
