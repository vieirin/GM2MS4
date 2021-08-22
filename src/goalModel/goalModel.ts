declare module GoalModel {
    export interface Model extends Node {
        nodes: Node
        orpahans: never[]
        dependencies: never[]
    }

    export interface Node {
        id: string
        text: string
        type: 'Actor'
        x: number
        y: number
        customProperties: {
            Description: string
        }
    }

    export interface Link {
        id: string
        type: string
        source: string
        target: string
    }
}
