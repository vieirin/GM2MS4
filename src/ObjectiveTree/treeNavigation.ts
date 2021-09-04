import { ObjectiveTree } from './types'

// extract element from a tree branch
export const branchGoals = (tree: ObjectiveTree): ObjectiveTree[] =>
    tree.children
        ?.filter((child) => child.type === 'goal')
        .map((child) => [child, ...branchGoals(child).flat()])
        .reduce(
            (prev, curr) => [...prev, ...curr],
            new Array<ObjectiveTree>()
        ) || []
