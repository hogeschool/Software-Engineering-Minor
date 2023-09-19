import { List, Map } from "immutable"
import { Coroutine, _throw, concurrent, getState, parallel, runCoroutine, setState, unitCoroutine, wait, waitUntil } from "./coroutine"
import { Fun } from "./fun"

export interface Entity {
  x: number
  y: number
  symbol: string
}

export interface DrawingState {
  deltaTime: number
  entities: Map<number, Entity>
}

export const drawScene = (entities: Map<number, Entity>): string => {
  let scene = ""
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 10; x++) {
      const maybeEntity = entities.find(entity => entity.x == x && entity.y == y)
      if (maybeEntity) {
        scene += maybeEntity.symbol
      }
      else {
        scene += "_"
      }
    }
    scene += "\n"
  }
  return scene
}

//find an entity given the id
const getEntity = (id: number): Coroutine<DrawingState, string, Entity> =>
  getState<DrawingState, string>()
  .thenBind(Fun((state: DrawingState) => {
    const maybeEntity = state.entities.get(id)
    if (maybeEntity) {
      return unitCoroutine<DrawingState, string, Entity>()(maybeEntity)
    }
    return _throw<DrawingState, string, Entity>()(`Entity with id ${id} does not exist.`)
  }))

//update entity position by id
const updateEntityPosition = (id: number, x: number, y: number): Coroutine<DrawingState, string, Entity> =>
  getEntity(id)
  .thenBind(Fun((entity: Entity) => 
    getState<DrawingState, string>()
    .thenBind(Fun((state: DrawingState) => {
      const updatedEntity = {
        ...entity,
        x: x,
        y: y
      }
      return setState<DrawingState, string>({
        ...state,
        entities: state.entities.set(id, updatedEntity)
      })
      .thenBind(Fun(_ => unitCoroutine<DrawingState, string, Entity>()(updatedEntity)))
    }))
  ))

//draw frame
const drawFrame : Coroutine<DrawingState, string, void> =
  getState<DrawingState, string>()
  .thenBind(Fun((state: DrawingState) => {
    const currentScene = drawScene(state.entities)
    console.log(currentScene)
    return unitCoroutine<DrawingState, string, void>()()
  }))

//keep drawing
const draw : Coroutine<DrawingState, string, void> =
  drawFrame
  .thenBind(Fun(_ => wait(0.5)))
  .thenBind(Fun(_ => draw))

const initialState : DrawingState = {
  deltaTime: 0,
  entities: Map(List([
    [0, { x: 0, y: 0, symbol: "*" }],
    [1, { x: 0, y :1, symbol: "#" }],
    [2, { x: 0, y :2, symbol: "&" }],
    [3, { x: 0, y :3, symbol: "%" }],
  ]))
}

const moveEntity = (id: number, idleTime: number) : Coroutine<DrawingState, string, void> =>
  getEntity(id)
  .thenBind(Fun((entity: Entity) => updateEntityPosition(id, entity.x + 1, entity.y)))
  .thenBind(Fun((entity: Entity) => {
    if (entity.x >= 5) {
      return unitCoroutine<DrawingState, string, void>()()
    }
    return wait<DrawingState, string>(idleTime)
    .thenBind(Fun(_ => moveEntity(id, idleTime)))
  }))

const replaceWithDollar : Coroutine<DrawingState, string, void> =
  getState<DrawingState, string>()
  .thenBind(Fun((state: DrawingState) => {
    const replacedEntities =
      state.entities.map(entity => {
        if (entity.x >= 5) {
          return {
            ...entity,
            symbol: "$"
          }
        }
        return entity 
      })
    return setState<DrawingState, string>({
      ...state,
      entities: replacedEntities
    })
  }))
  .thenBind(Fun (_ => unitCoroutine<DrawingState, string, void>()()))
  .onlyIf(
    getState<DrawingState, string>()
    .thenBind(Fun((state: DrawingState) =>  unitCoroutine<DrawingState, string, boolean>()(state.entities.filter(entity => entity.x >= 5).count() > 0)))
  )



export const runExercise6 = () =>
  runCoroutine(
    initialState, 
    concurrent(draw, replaceWithDollar.parallel(
      moveEntity(0, 1)
      .concurrent(moveEntity(1, 3))
      .concurrent(moveEntity(2, 1))
      .concurrent(moveEntity(3, 2))
    ).thenBind(Fun(_ => drawFrame))
  ))