export type CcKvListExplorerState =
  | CcKvListExplorerStateLoading
  | CcKvListExplorerStateLoaded
  | CcKvListExplorerStateLoadingMore
  | CcKvListExplorerStateFiltering;

export interface CcKvListExplorerStateLoading {
  type: 'loading';
}

export interface CcKvListExplorerStateLoaded {
  type: 'loaded';
  elements: Array<CcKvListElementState>;
  addForm: CcKvListExplorerAddFormState;
}

export interface CcKvListExplorerStateLoadingMore {
  type: 'loading-more';
  elements: Array<CcKvListElementState>;
  addForm: CcKvListExplorerAddFormState;
}

export interface CcKvListExplorerStateFiltering {
  type: 'filtering';
  elements: Array<CcKvListElementState>;
  addForm: CcKvListExplorerAddFormState;
}

export type CcKvListElementState =
  | CcKvListElementStateIdle
  | CcKvListElementStateDeleting
  | CcKvListElementStateEditing
  | CcKvListElementStateUpdating;

export interface CcKvListElementStateIdle extends CcKvListElement {
  type: 'idle';
}

export interface CcKvListElementStateDeleting extends CcKvListElement {
  type: 'deleting';
}

export interface CcKvListElementStateEditing extends CcKvListElement {
  type: 'editing';
}

export interface CcKvListElementStateUpdating extends CcKvListElement {
  type: 'updating';
}

export interface CcKvListElement {
  index: number;
  value: string;
}

// - add form

export type CcKvListExplorerAddFormState = CcKvListExplorerAddFormStateIdle | CcKvListExplorerAddFormStateAdding;

export interface CcKvListExplorerAddFormStateIdle {
  type: 'idle';
}

export interface CcKvListExplorerAddFormStateAdding {
  type: 'adding';
}
