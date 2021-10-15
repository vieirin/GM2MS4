import { linkedNode } from '../ObjectiveTree/treeNavigation.js'
import { leafType } from '../ObjectiveTree/types.js'

export type allowedTypes = 'string' | 'float' | 'int'

export type SequenceState = linkedNode[][]

export type execNode = {
    name: string
    type: leafType
    input?: [string, allowedTypes][]
    outputType?: [string, allowedTypes]
    children?: execNode[]
}
