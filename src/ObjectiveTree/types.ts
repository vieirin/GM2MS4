import { GoalModel } from '../types/gm'

export type relationship = 'and' | 'or' | 'none'

export interface ObjectiveTree extends GoalModel.Node {
    children?: ObjectiveTree[]
    relation: relationship
}

export const TraverseTree = (tree: ObjectiveTree, tabs = 0) => {
    console.log(`\n${'\t'.repeat(tabs)}id:`, tree.id)
    console.log(`${'\t'.repeat(tabs)}title:`, tree.text)
    console.log(`${'\t'.repeat(tabs)}type:`, tree.type)
    console.log(`${'\t'.repeat(tabs)}relation:`, tree.relation)
    console.log(`${'\t'.repeat(tabs)}child: `)
    for (let child of tree.children || []) {
        TraverseTree(child, tabs + 1)
    }
}
