export type EditorPanelHandle = {
  isDirty: () => boolean
  save: () => Promise<boolean>
}
