export type CcKvHashExplorerState =
  | CcKvHashExplorerStateLoading
  | CcKvHashExplorerStateLoaded
  | CcKvHashExplorerStateLoadingMore
  | CcKvHashExplorerStateFiltering;

export interface CcKvHashExplorerStateLoading {
  type: 'loading';
}

export interface CcKvHashExplorerStateLoaded {
  type: 'loaded';
  elements: Array<CcKvHashElementState>;
  addForm: CcKvHashExplorerAddFormState;
}

export interface CcKvHashExplorerStateLoadingMore {
  type: 'loading-more';
  elements: Array<CcKvHashElementState>;
  addForm: CcKvHashExplorerAddFormState;
}

export interface CcKvHashExplorerStateFiltering {
  type: 'filtering';
  elements: Array<CcKvHashElementState>;
  addForm: CcKvHashExplorerAddFormState;
}

export type CcKvHashElementState =
  | CcKvHashElementStateIdle
  | CcKvHashElementStateDeleting
  | CcKvHashElementStateEditing
  | CcKvHashElementStateUpdating;

export interface CcKvHashElementStateIdle extends CcKvHashElement {
  type: 'idle';
}

export interface CcKvHashElementStateDeleting extends CcKvHashElement {
  type: 'deleting';
}

export interface CcKvHashElementStateEditing extends CcKvHashElement {
  type: 'editing';
}

export interface CcKvHashElementStateUpdating extends CcKvHashElement {
  type: 'updating';
}

export interface CcKvHashElement {
  field: string;
  value: string;
}

// - add form

export type CcKvHashExplorerAddFormState = CcKvHashExplorerAddFormStateIdle | CcKvHashExplorerAddFormStateAdding;

export interface CcKvHashExplorerAddFormStateIdle {
  type: 'idle';
}

export interface CcKvHashExplorerAddFormStateAdding {
  type: 'adding';
}
