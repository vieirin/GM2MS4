import { nameTaskMethod } from '../ms4Builder/naming'
import { leafType, ObjectiveTree, relationship, treeNode } from './types'

// extract element from a tree branch
export const branchGoals = (
    component: string,
    tree: ObjectiveTree
): ObjectiveTree[] =>
    tree.children
        ?.filter(
            (child) => child.type === 'goal' && child.component === component
        )
        .map((child) => [child, ...branchGoals(component, child).flat()])
        .reduce(
            (prev, curr) => [...prev, ...curr],
            new Array<ObjectiveTree>()
        ) || []

export const getGoals = (tree: ObjectiveTree): ObjectiveTree[] => {
    return (
        tree.children
            ?.filter((child) => child.type === 'goal')
            .map((child) => [child, ...getGoals(child).flat()])
            .reduce(
                (prev, curr) => [...prev, ...curr],
                new Array<ObjectiveTree>()
            ) || []
    )
}

export type func = { name: string; refiner: boolean }

export type RunnerDecomposition = {
    fromState: string
    relation: relationship
    component: string
    nodeType: leafType | 'refiner'
    functions: func[]
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
    component: tree.component,
    nodeType: hasChildren(tree) && tree.type === 'task' ? 'refiner' : tree.type,
    functions:
        tree.children
            ?.filter(
                (child) =>
                    child.type === 'task' &&
                    !hasChildren(child) &&
                    child.component === component
            )
            .map((child) => ({
                name: nameTaskMethod(child.text, hasChildren(child)),
                refiner: hasChildren(child)
            })) || [],
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

type port = {
    from: string
    to: string
    type: 'string'
    rootLink: boolean
}

export type ExtenalMessages = {
    output: port[]
    input: port[]
}

type Connections = {
    [K: string]: ExtenalMessages
}

const createPort = (from: treeNode, to: treeNode) => ({
    from: from.identifier + from.text,
    to: to.identifier + from.text,
    type: 'String',
    rootLink: from.isRoot || to.isRoot
})

// this will find connections over the tree between distincts components and describing them on the
// Connections structure form
export const componentConnections = (tree: ObjectiveTree): Connections => {
    return tree.children?.reduce((memo, child) => {
        const treeComponent = tree.component
        const transitionMemo: Connections = {
            ...memo,
            ...componentConnections(child)
        }
        return child.component !== tree.component
            ? {
                  ...transitionMemo,
                  [treeComponent]: {
                      output: [
                          ...(transitionMemo[treeComponent]?.output || []),
                          createPort(tree, child)
                      ],
                      input: [
                          ...(transitionMemo[treeComponent]?.input || []),
                          createPort(child, tree)
                      ]
                  },
                  [child.component]: {
                      output: [
                          ...(transitionMemo[child.component]?.output || []),
                          createPort(child, tree)
                      ],
                      input: [
                          ...(transitionMemo[child.component]?.input || []),
                          createPort(tree, child)
                      ]
                  }
              }
            : transitionMemo
    }, {} || {}) as Connections
}
