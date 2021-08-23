import { convertToTree, loadModel } from './ObjectiveTree'
import { TraverseTree } from './ObjectiveTree/types'

const validModel = loadModel('models/txregister.txt')
convertToTree(validModel).forEach((tree) => TraverseTree(tree))
