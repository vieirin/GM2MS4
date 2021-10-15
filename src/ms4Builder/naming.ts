import { MS4Constants } from './constants.js'
const latinChars = `ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐ
ÑÒÓÔÕÖØÙÚÛÜ
ÝŔÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿŕ()-` as const

const nonLatinChars = `AAAAAAACEEEEIIIIDN
OOOOOOUUUUYRsBaaa
aaaaceeeeiiiionoooooouuuuybyr___` as const

const sanitizeText = (text: string) =>
    text
        .split('')
        .map((c) =>
            latinChars.indexOf(c) > -1
                ? nonLatinChars.charAt(latinChars.indexOf(c))
                : c
        )
        .join('')

export const nameText = (text: string) =>
    sanitizeText(text).trim().replace(/ /g, '_')

export const nodeName = (
    text: string,
    type: 'goal' | 'task'
): [string, string, string[] | undefined] => {
    const goalText = text.split(':')
    if (goalText.length < 2) {
        throw new Error('Missing element identifier: TX or GX')
    }
    const [goalName, goalSeq] = goalText[1].split('[')
    const cleanSeq = goalSeq?.slice(0, -1)?.split(';')

    switch (type) {
        case 'goal':
            if (!goalText[0].match(/G\d*/)) {
                throw new Error(
                    'Goal text must start with `G%d:` string, got: ' + goalText
                )
            }
            break
        case 'task':
            if (!goalText[0].match(/T\d*/)) {
                throw new Error(
                    'Task text must start with `T%d:` string, got: ' + goalText
                )
            }
    }
    return [goalText[0], nameText(goalName), cleanSeq]
}

export const nameInput = (stateName: string) => nameText(stateName)

export const nameTaskMethod = (taskName: string, hasChildren?: boolean) =>
    nameText(taskName) + (hasChildren ? '_runner' : '') + '_task'

export const transitionClassVarName = (component: string) =>
    nameText(component) + '_transition'

export const transitionMethodName = (state: string) =>
    nameText(state).toLowerCase() + '_runner'

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export const sanitizeComponent = (component: string) =>
    capitalize(component).replace(/ /g, '')

export const dnlFileName = (component: string) =>
    sanitizeComponent(component) + '.dnl'

export const SeSFileName =
    sanitizeComponent(MS4Constants.MODEL_PERSPECTIVE) + '.ses'

export const taskVarName = (component: string) =>
    sanitizeComponent(component) + 'Runner'

export const transitionClassName = (component: string) =>
    capitalize(component) + 'TransitionsClass'

export const nameGoalContinuation = (goal: string) =>
    sanitizeComponent(goal) + '_continue'
