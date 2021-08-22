import { readFileSync } from 'fs'

export const loadModel = (filename: string) => {
    const modelFile = readFileSync(filename)
    const model = JSON.parse(modelFile.toString()) as GoalModel.Model

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

    return root
}
