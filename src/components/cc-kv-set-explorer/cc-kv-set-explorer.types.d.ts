export type CcKvSetExplorerState =
  | CcKvSetExplorerStateLoading
  | CcKvSetExplorerStateLoaded
  | CcKvSetExplorerStateLoadingMore
  | CcKvSetExplorerStateFiltering;

export interface CcKvSetExplorerStateLoading {
  type: 'loading';
}

export interface CcKvSetExplorerStateLoaded {
  type: 'loaded';
  elements: Array<CcKvSetElementState>;
  addForm: CcKvSetExplorerAddFormState;
}

export interface CcKvSetExplorerStateLoadingMore {
  type: 'loading-more';
  elements: Array<CcKvSetElementState>;
  addForm: CcKvSetExplorerAddFormState;
}

export interface CcKvSetExplorerStateFiltering {
  type: 'filtering';
  elements: Array<CcKvSetElementState>;
  addForm: CcKvSetExplorerAddFormState;
}

export type CcKvSetElementState = CcKvSetElementStateIdle | CcKvSetElementStateDeleting | CcKvSetElementStateEditing;

export interface CcKvSetElementStateIdle extends CcKvSetElement {
  type: 'idle';
}

export interface CcKvSetElementStateDeleting extends CcKvSetElement {
  type: 'deleting';
}

export interface CcKvSetElementStateEditing extends CcKvSetElement {
  type: 'editing';
}

export interface CcKvSetElement {
  value: string;
}

// - add form

export type CcKvSetExplorerAddFormState = CcKvSetExplorerAddFormStateIdle | CcKvSetExplorerAddFormStateAdding;

export interface CcKvSetExplorerAddFormStateIdle {
  type: 'idle';
}

export interface CcKvSetExplorerAddFormStateAdding {
  type: 'adding';
}
