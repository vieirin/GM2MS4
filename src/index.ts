import { generateGoalModelDNLs } from './ms4Builder'
import { loadModel } from './ObjectiveTree'

const validModel = loadModel('models/newmodel.txt')
// convertToTree(validModel).forEach((tree) => TraverseTree(tree))
// generateWaitForInput(leveledComponent[0])
generateGoalModelDNLs(validModel)

console.log('done')
