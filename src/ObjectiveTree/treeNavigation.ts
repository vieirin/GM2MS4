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
    functions: string[]
    nextLevel: RunnerDecomposition[]
}

export const runnerDecomposition = (
    tree: ObjectiveTree
): RunnerDecomposition => ({
    fromState: tree.text,
    relation: tree.relation,
    functions:
        tree.children
            ?.filter((child) => child.type === 'task')
            .map((child) => nameTaskMethod(child.text) + '()') || [],
    nextLevel: tree.children?.map(runnerDecomposition) || []
})
