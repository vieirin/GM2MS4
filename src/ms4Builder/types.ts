import { leafType, ObjectiveTree } from '../ObjectiveTree/types'

export type allowedTypes = 'string' | 'float' | 'int'

export type SequenceState = ObjectiveTree[]

export type execNode = {
    name: string
    type: leafType
    input?: [string, allowedTypes][]
    outputType?: [string, allowedTypes]
    children?: execNode[]
}
