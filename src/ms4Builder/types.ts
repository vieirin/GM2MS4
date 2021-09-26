import { linkedNode } from '../ObjectiveTree/treeNavigation'
import { leafType } from '../ObjectiveTree/types'

export type allowedTypes = 'string' | 'float' | 'int'

export type SequenceState = linkedNode[][]

export type execNode = {
    name: string
    type: leafType
    input?: [string, allowedTypes][]
    outputType?: [string, allowedTypes]
    children?: execNode[]
}
