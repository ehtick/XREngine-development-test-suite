import React, { } from 'react'
import { useDrop } from 'react-dnd'
import { DndWrapper } from '@etherealengine/editor/src/components/dnd/DndWrapper'
import { SupportedFileTypes } from '@etherealengine/editor/src/constants/AssetTypes'
import { Template } from './template'
import { useHookstate } from '@etherealengine/hyperflux'
import { uploadToFeathersService } from '@etherealengine/client-core/src/util/upload'
import { createEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { getComponent, getMutableComponent, setComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { TransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'
import { Vector3 } from 'three'
import { VisibleComponent } from '@etherealengine/engine/src/scene/components/VisibleComponent'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { LODComponent } from '@etherealengine/engine/src/scene/components/LODComponent'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { ModelInterface } from '@etherealengine/common/src/interfaces/ModelInterface'

const LODsDND = () => {
  const filenames = useHookstate<string[]>([])

  const [{ canDrop, isOver, isDragging, isUploaded }, onDropTarget] = useDrop({
    accept: [...SupportedFileTypes, '.glb'],
    async drop(item: any, monitor) {
      if (item.files) {
        const dndItem = monitor.getItem()
        const entries = Array.from(dndItem.items).map((item: any) => item.webkitGetAsEntry())
        try {
          const files = await Promise.all(
            entries.map((entry) => new Promise((resolve, reject) => entry.file(resolve, reject)))
          ) as File[]
          filenames.set(files.map((file) => file.name))

          const uploadPromise = uploadToFeathersService('upload-asset', files, {
            type: 'admin-file-upload',
            args: {
              staticResourceType: 'model3d',
            },
            variants: true
          })

          const result = await uploadPromise.promise as ModelInterface

          console.log(result)

          const variants = result.glbStaticResource?.variants ?? result.gltfStaticResource?.variants ?? result.fbxStaticResource?.variants ?? result.usdzStaticResource?.variants

          const entity = createEntity()
          setComponent(entity, TransformComponent, { position: new Vector3(0, 0, -2) })
          setComponent(entity, VisibleComponent)
          setComponent(entity, NameComponent, 'LOD Test')
          
          setComponent(entity, ModelComponent, {
            src: variants[0].url,
          })
          setComponent(entity, LODComponent, {
            target: entity,
            levels: variants.map((variant, i) => ({
              distance: (i + 1) * 5,
              loaded: false,
              src: variant.url,
              model: null,
              metadata: variant.metadata
            })),
            lodHeuristic: 'DISTANCE'
          })

        } catch (err) {
          console.error(err)
        }
      }
    },
    collect: (monitor) => ({
      canDrop: monitor.canDrop(),
      isOver: monitor.isOver(),
      isDragging: monitor.getItem() !== null && monitor.canDrop(),
      isUploaded: !monitor.getItem()?.files
    })
  })

  return <div style={{ height: '100%', width: '100%', background: 'white', fontSize: '20px' }} ref={onDropTarget}>
    Drag and drop LOD files here!
    {filenames.value.map((filename, i) => <div key={filename + i}> - {filename}</div>)}
  </div>
}

export default function LODs() {

  return (
    <div id="dnd-container" style={{ height: '25%', width: '25%', pointerEvents: 'all' }}>
      <DndWrapper id="dnd-container">
        <Template />
        <LODsDND />
      </DndWrapper>
    </div>
  )
}