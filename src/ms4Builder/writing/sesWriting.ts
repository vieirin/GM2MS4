import { port } from '../../ObjectiveTree/connections'
import { component } from '../../ObjectiveTree/types'
import { MS4Constants } from '../constants'
import { sanitizeComponent } from '../naming'
import { blockseparator } from './dnlWriting'

const perspectiveString = `
from the ${MS4Constants.MODEL_PERSPECTIVE} perspective`

const madeOfString = (components: component[]) => {
    const last = components.pop()
    return [...components, `and ${last}`].join(', ')
}

export const writePerspective = (
    missionName: string,
    components: component[]
) =>
    blockseparator(`
${perspectiveString}, ${missionName} is made of ${madeOfString(
        components.map(sanitizeComponent)
    )}!
${perspectiveString}, ${missionName} sends StartUp to ${sanitizeComponent(
        components[0]
    )}!
`)

export const writeConnections = (connections: port[]) =>
    blockseparator(
        connections.map(({ outputPortName, from, to }) =>
            `${perspectiveString}, ${from.component} sends ${outputPortName} to ${to.component}!`.trim()
        )
    )

export const writeStopRelation = (rootNode: string, components: component[]) =>
    blockseparator(
        components.map((component) =>
            `${perspectiveString}, ${rootNode} sends ${MS4Constants.stopPort} to ${component}!`.trim()
        )
    )
