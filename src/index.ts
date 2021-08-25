import { generateWaitForInput } from './ms4Builder'
import { convertToTree, getGoals, loadModel } from './ObjectiveTree'

const validModel = loadModel('models/txregister_component.txt')
// convertToTree(validModel).forEach((tree) => TraverseTree(tree))
const leveledComponent = convertToTree(validModel).map((tree) =>
    getGoals(tree, 'api')
)
generateWaitForInput(leveledComponent[0])
