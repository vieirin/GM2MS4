export const nameText = (text: string) => text.trim().replace(/ /g, '_')

export const nameInput = (stateName: string) => nameText(stateName) + '_input'

export const nameTaskMethod = (taskName: string) => nameText(taskName) + '_task'
