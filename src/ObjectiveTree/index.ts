import { readFileSync } from 'fs'
import { Actor, Model, Node, NodeType } from '../GoalModel'
import { nameText } from '../ms4Builder/naming'
import {
    component,
    ComponentGoals,
    leafType,
    LeveledGoalComponent,
    ObjectiveTree,
    relationship
} from './types'

export const validateModel = (model: Model) => {
    const root = model.actors
        .map((item) =>
            // check in node list if there are more than one root
            item.nodes.reduce((hasRoot, node) => {
                if (hasRoot && node.customProperties.selected) {
                    return false
                }
                return node.customProperties.selected || hasRoot
            }, false)
        )
        // reduce the actors array to "are all actors valid?"
        .reduce((isValid, actorRootValid) => isValid && actorRootValid, true)
    if (!root) {
        throw 'invalid number of root, one allowed'
    }
}

export const loadModel = (filename: string) => {
    const modelFile = readFileSync(filename)
    const model = JSON.parse(modelFile.toString()) as Model

    validateModel(model)

    return model
}

export const convertIstarType = (type: NodeType) => {
    switch (type) {
        case 'istar.Goal':
            return 'goal'
        case 'istar.Task':
            return 'task'
        default:
            throw new Error('Invalid node type: ' + type)
    }
}

export const convertToTree = (model: Model) => {
    validateModel(model)

    const nodeChildren = (
        actor: Actor,
        id?: string
    ): [ObjectiveTree[] | undefined, relationship] => {
        if (!id) {
            return [undefined, 'none']
        }

        // find related objects in the links array
        const links = model.links.filter((link) => link.target === id)

        // get the set of relations associated to the parent element
        const relations = links.map((link) => {
            switch (link.type) {
                case 'istar.AndRefinementLink':
                    return 'and'
                case 'istar.OrRefinementLink':
                    return 'or'
                default:
                    throw new Error(
                        `[UNSUPPORTED LINK]: Please implement ${link.type} decoding`
                    )
            }
        })

        // assert all elements are equal
        const allEqual = relations.every((v) => v === relations[0])
        if (!allEqual) {
            throw new Error(`
                [INVALID MODEL]: You can't mix and/or relations
            `)
        }

        // recursively find children nodes' children
        const children: ObjectiveTree[] = links
            .map((link) => {
                // from links find linked the linked nodes
                const node = actor.nodes.find((item) => item.id === link.source)
                if (!node) {
                    return undefined
                }

                node.text = nameText(node.text)

                const [granChildren, relation] = nodeChildren(actor, node?.id)
                return {
                    ...node,
                    children: granChildren,
                    relation,
                    type: convertIstarType(node.type)
                }
            })
            // clean undefined children from the tree
            .filter((child) => child !== undefined) as ObjectiveTree[]

        return [[...children], relations[0]]
    }

    const nodeToTree = (actor: Actor, node: Node): ObjectiveTree => {
        const [children, relation] = nodeChildren(actor, node?.id)
        return {
            ...node,
            relation,
            children: children,
            type: convertIstarType(node.type)
        }
    }

    const trees = model.actors
        .map((actor) => {
            // find root node
            const rootNode = actor.nodes.find(
                (item) => item.customProperties.selected
            )
            if (!rootNode) {
                return undefined
            }

            // calc tree
            return nodeToTree(actor, rootNode)
        })
        // filter undefined trees (those without a root node)
        .filter((tree) => tree) as ObjectiveTree[]

    return trees
}

const findComponents = (tree: ObjectiveTree): component[] => {
    if (!tree.children || tree.children.length === 0) {
        return []
    }

    return [
        tree.customProperties.component || '',
        ...tree.children.map((child) => findComponents(child)).flat()
    ].filter((item) => item)
}

const getComponents = (tree: ObjectiveTree) => {
    return [...new Set(findComponents(tree))]
}

export const getNodes = (
    tree: ObjectiveTree,
    component: string,
    type: leafType,
    level = 0
): LeveledGoalComponent[] => {
    const { children, ...node } = tree
    const nodeComponent = node.customProperties.component

    // for nodes matching the component asked - 'api' for example - and has children
    // search on they for new "type" node
    if (nodeComponent === component) {
        // type === 'task' && console.log(node, children)

        if (children && children.length > 0) {
            const treeLevel = node.customProperties.selected ? level : level + 1
            return (
                [
                    type === node.type && {
                        ...tree,
                        level: treeLevel
                    },
                    ...children
                        .map((child) =>
                            getNodes(child, component, type, treeLevel)
                        )
                        .flat()
                ]
                    // filter "false" from the return array
                    .filter((node) => node) as LeveledGoalComponent[]
            )
        } else {
            if (type !== node.type || nodeComponent !== component) {
                return []
            } else {
                return [{ ...node, level }]
            }
        }
    } else {
        // case it matches a goal from a diff component keep searching for goals
        // of this type on other components children
        return [
            ...(children
                ?.map((child) => getNodes(child, component, type, level))
                .flat()
                .filter((item) => item.type === type) || [])
        ]
    }
}

const lowestGoalLevel = (goals: LeveledGoalComponent[]) => {
    return Math.min(...goals.map((item) => item.level))
}

export const getTreeNodeByComponent = (type: leafType, tree: ObjectiveTree) => {
    type keyedComponent = [string, LeveledGoalComponent[]]

    const componentsGoals = getComponents(tree)
        .map(
            (component) =>
                [component, getNodes(tree, component, type)] as keyedComponent
        )
        .map(
            ([component, goals]) =>
                [
                    component,
                    { lowestLevel: lowestGoalLevel(goals), goals }
                ] as ComponentGoals
        )

    return componentsGoals
}
