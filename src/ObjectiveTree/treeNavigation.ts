import { nameGoalContinuation, nameTaskMethod } from '../ms4Builder/naming.js'
import { StatePortIndex } from './connections.js'
import { component, leafType, ObjectiveTree, relationship } from './types.js'

type node = ObjectiveTree & {
    originalName?: string
    direction?: 'in' | 'out'
    returnToParent?: boolean
    parentRelation: 'and' | 'or' | 'none'
}

const branchGoals = (component: component, tree?: ObjectiveTree): node[] => {
    return (
        tree?.type === 'goal' && tree?.component === component
            ? [{ ...tree }, ...(branchChildrenGoals(component, tree) || [])]
            : [
                  //   ...(tree.children
                  //       ?.map((child) => brGoals(component, child))
                  //       .flat() || [])
              ].flat()
    ).filter((n) => n) as node[]
}

// extract element from a tree branch
export const branchChildrenGoals = (
    component: string,
    tree: ObjectiveTree,
    level = 0
): node[] =>
    tree.children
        ?.filter((child) => child.type === 'goal')
        .flatMap((child) => {
            if (child.component === component) {
                const childGoals = branchChildrenGoals(
                    component,
                    child,
                    level + 1
                )
                if (!childGoals.length) {
                    return [
                        {
                            ...child,
                            parentRelation: tree.relation,
                            returnToParent: true
                        }
                    ]
                } else {
                    // verify if any of the children is from a different component
                    const direction = child.children?.reduce(
                        (prev, curr) => prev || curr.component !== component,
                        false
                    )
                        ? 'out'
                        : undefined
                    return [
                        { ...child, direction, parentRelation: tree.relation },
                        ...childGoals
                    ] as node[]
                }
            } else {
                return (
                    [
                        {
                            ...child,
                            text: nameGoalContinuation(child.text),
                            originalName: child.text,
                            parentRelation: tree.relation,
                            direction: 'in' as 'in' | 'out'
                        }
                    ]
                        // when the root level contains only different components
                        // we add the child's out port to the returned array
                        .concat(
                            !level
                                ? [
                                      {
                                          ...child,
                                          originalName: child.text,
                                          direction: 'out',
                                          parentRelation: tree.relation
                                      }
                                  ]
                                : []
                        )
                        .reverse() as node[]
                )
            }
        })
        .reduce((prev, curr) => [...prev, curr], new Array<node>()) || []

export type linkedNode = node & { port: string }

const splitSequece = (component: component, nodes: node[]): node[][] => {
    const firstOutput = nodes.findIndex(
        (node) => node.component !== component && node.direction === 'out'
    )
    if (firstOutput == -1) {
        return [nodes]
    }
    return [
        nodes.slice(0, firstOutput + 1),
        ...splitSequece(component, nodes.slice(firstOutput + 1))
    ]
}

export const branchGoalsWithOutput = (
    component: component,
    tree: ObjectiveTree,
    goalOutput: StatePortIndex
): linkedNode[][] => {
    const branch = branchGoals(component, tree)
    const seq: linkedNode[][] = splitSequece(component, branch)
        .map((sequence) =>
            sequence.map((goal) => ({
                ...goal,
                port:
                    goalOutput.get(goal.originalName || goal.text)?.[
                        goal.direction || 'in'
                    ] || ''
            }))
        )
        .filter((seq) => seq.length > 0)

    // move output from the input to the last objective to be executed
    const lastSeq = seq[seq.length - 1]
    const lastGoal = lastSeq?.[lastSeq?.length - 1 || 0]
    const treeConn = goalOutput.get(tree.text)
    if (treeConn) {
        lastGoal.port = treeConn?.out
    }
    return seq
}

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
    parentRelation: relationship
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
    component: string,
    parentRelation: relationship = 'none'
): RunnerDecomposition => ({
    fromState: tree.text,
    relation: tree.relation,
    parentRelation,
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
            .map((child) =>
                runnerDecomposition(child, component, tree.relation)
            ) || []
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
