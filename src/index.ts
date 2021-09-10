import { generateGoalModelDNLs } from './ms4Builder'
import { loadModel } from './ObjectiveTree'

const validModel = loadModel('models/txregister_component3.txt')
// convertToTree(validModel).forEach((tree) => TraverseTree(tree))
// generateWaitForInput(leveledComponent[0])
generateGoalModelDNLs(validModel)

console.log('done')
