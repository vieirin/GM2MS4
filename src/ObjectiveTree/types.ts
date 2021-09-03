import { Node } from 'GoalModel'

export type relationship = 'and' | 'or' | 'none'
export type component = string
export type leafType = 'task' | 'goal' | 'resource'

export type child = ObjectiveTree

export interface ObjectiveTree extends Omit<Node, 'type'> {
    type: leafType
    children?: child[]
    relation: relationship
}

export interface LeveledGoalComponent extends ObjectiveTree {
    level: number
}

export type ComponentData = {
    lowestLevel: number
    goals: LeveledGoalComponent[]
}
export type ComponentGoals = [component, ComponentData]

export const TraverseTree = (tree: ObjectiveTree, tabs = 0) => {
    console.log(`\n${'\t'.repeat(tabs)}id:`, tree.id)
    console.log(`${'\t'.repeat(tabs)}title:`, tree.text)
    console.log(`${'\t'.repeat(tabs)}type:`, tree.type)
    console.log(`${'\t'.repeat(tabs)}relation:`, tree.relation)
    console.log(`${'\t'.repeat(tabs)}child: `)
    for (const child of tree.children || []) {
        TraverseTree(child, tabs + 1)
    }
}
