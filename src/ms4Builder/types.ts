import { leafType } from '../ObjectiveTree/types'

export type allowedTypes = 'string' | 'float' | 'int'

export type execNode = {
    name: string
    type: leafType
    input?: [string, allowedTypes][]
    outputType?: [string, allowedTypes]
    children?: execNode[]
}
