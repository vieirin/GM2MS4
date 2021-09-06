import { ObjectiveTree } from './types'

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
