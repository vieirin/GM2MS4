import { Node } from '../GoalModel'

export type relationship = 'and' | 'or' | 'none'
export type component = string
export type leafType = 'task' | 'goal' | 'resource'

export type child = GoalTree
export type treeNode = GoalTree

export interface annotatedNode extends Omit<Node, 'type' | 'customProperties'> {
    type: leafType
    isRoot: boolean
    component: string
    identifier: string
}

export interface GoalTree extends annotatedNode {
    component: string
    children?: child[]
    relation: relationship
}

export interface LeveledGoalComponent extends GoalTree {
    parentRelation: relationship
    level: number
}

export type ComponentData = {
    lowestLevel: number
    goals: LeveledGoalComponent[]
}
export type ComponentGoals = [component, ComponentData]

export const TraverseTree = (tree: GoalTree, print?: boolean, tabs = 0) => {
    if (print) {
        console.log(`\n${'\t'.repeat(tabs)}id:`, tree.id)
        console.log(`${'\t'.repeat(tabs)}title:`, tree.text)
        console.log(`${'\t'.repeat(tabs)}type:`, tree.type)
        console.log(`${'\t'.repeat(tabs)}relation:`, tree.relation)
        console.log(`${'\t'.repeat(tabs)}child: `)
    }
    for (const child of tree.children || []) {
        TraverseTree(child, print, tabs + 1)
    }
}
