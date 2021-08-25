declare module 'GoalModel' {
    export type id = string

    export interface Model {
        actors: Actor[]
        orpahans: never[]
        dependencies: never[]
        links: Link[]
        display: Display
        tool: string
        istar: string
        saveDate: Date
        diagram: Diagram
    }

    export interface Actor extends Node {
        nodes: Node[]
    }

    export interface Node extends CustomProperties {
        id: id
        text: string
        type: 'istar.Task' | 'istar.Goal' | 'istar.Actor'
        x: number
        y: number
    }

    export interface Link {
        id: id
        type: 'istar.AndRefinementLink' | 'istar.OrRefinementLink'
        source: string
        target: string
    }

    export interface Display {
        [K: string]: DisplayItem
    }

    export interface DisplayItem {
        backgroundColor: string
        width?: number
        height?: number
    }

    export interface Diagram extends CustomProperties {
        width: number
        height: number
    }

    export interface CustomProperties {
        customProperties: {
            Description: ''
            selected?: boolean
            component?: string
            receives?: string
        }
    }
}
