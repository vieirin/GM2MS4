import { nameTaskMethod } from '../ms4Builder/naming'
import { ObjectiveTree, relationship } from './types'

// extract element from a tree branch
export const branchGoals = (
    component: string,
    tree: ObjectiveTree
): ObjectiveTree[] =>
    tree.children
        ?.filter(
            (child) =>
                child.type === 'goal' &&
                child.customProperties.component === component
        )
        .map((child) => [child, ...branchGoals(component, child).flat()])
        .reduce(
            (prev, curr) => [...prev, ...curr],
            new Array<ObjectiveTree>()
        ) || []

export type RunnerDecomposition = {
    fromState: string
    relation: relationship
    component: string
    functions: string[]
    nextLevel: RunnerDecomposition[]
}

export const printDecomposition = (
    decomposition: RunnerDecomposition,
    ident = 0
) => {
    const identation = '\t'.repeat(ident)
    console.group(identation, 'from', decomposition.fromState)
    console.log(identation, 'fns', decomposition.functions)
    console.log(identation, 'relation', decomposition.relation)
    console.groupEnd()
    decomposition.nextLevel.forEach((level) => {
        printDecomposition(level, ident + 1)
    })
}

export const hasChildren = (node: ObjectiveTree) =>
    (node.children?.length || 0) > 0

export const runnerDecomposition = (
    tree: ObjectiveTree,
    component: string
): RunnerDecomposition => ({
    fromState: tree.text,
    relation: tree.relation,
    component: tree.customProperties.component || '',
    functions:
        tree.children
            ?.filter(
                (child) =>
                    child.type === 'task' &&
                    child.customProperties?.component === component
            )
            .map((child) => nameTaskMethod(child.text, hasChildren(child))) ||
        [],
    nextLevel:
        tree.children
            ?.filter(hasChildren)
            .map((child) => runnerDecomposition(child, component)) || []
})

export const removeLeafNodes = (tree: ObjectiveTree): ObjectiveTree => {
    const { children, ...rest } = tree
    return {
        ...rest,
        children: children
            ?.filter((child) => child.children?.length || 0 > 0)
            .map(removeLeafNodes)
    }
}
