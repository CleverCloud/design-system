import { CcKvHashExplorerState } from '../cc-kv-hash-explorer/cc-kv-hash-explorer.types.js';
import { CcKvListExplorerState } from '../cc-kv-list-explorer/cc-kv-list-explorer.types.js';
import { CcKvSetExplorerState } from '../cc-kv-set-explorer/cc-kv-set-explorer.types.js';
import { CcKvKeyStringEditorState } from '../cc-kv-string-editor/cc-kv-string-editor.types.js';

export type CcKvExplorerState =
  | CcKvExplorerStateLoading
  | CcKvExplorerStateError
  | CcKvExplorerStateLoadingKeys
  | CcKvExplorerStateFiltering
  | CcKvExplorerStateRefreshing
  | CcKvExplorerStateLoaded;

export interface CcKvExplorerStateLoading {
  type: 'loading';
}

export interface CcKvExplorerStateError {
  type: 'error';
}

export interface CcKvExplorerStateLoadingKeys {
  type: 'loading-keys';
  keys: Array<CcKvKeyState>;
  total: number;
}

export interface CcKvExplorerStateFiltering {
  type: 'filtering';
  keys: Array<CcKvKeyState>;
  total: number;
}

export interface CcKvExplorerStateRefreshing {
  type: 'refreshing';
  keys: Array<CcKvKeyState>;
  total: number;
}

export interface CcKvExplorerStateLoaded {
  type: 'loaded';
  keys: Array<CcKvKeyState>;
  total: number;
}

//-- filter ---

export type CcKvKeyFilter = {
  type: 'all' | CcKvKeyType;
  pattern?: string | null;
};

//-- key state ---

export interface CcKvKeyState {
  type: 'idle' | 'selected' | 'deleting';
  key: CcKvKey;
}

//-- key ---

export type CcKvKeyType = 'string' | 'hash' | 'list' | 'set';

export interface CcKvKey<T extends CcKvKeyType = CcKvKeyType> {
  type: T;
  name: string;
  // TODO add TTL
}

//-- key value ---

export type CcKvKeyValue = CcKvKeyValueString | CcKvKeyValueList | CcKvKeyValueHash | CcKvKeyValueSet;

export interface CcKvKeyValueString extends CcKvKey<'string'> {
  value: string;
}
export interface CcKvKeyValueHash extends CcKvKey<'hash'> {
  elements: Array<CcKvKeyValueHashElement>;
}
export interface CcKvKeyValueList extends CcKvKey<'list'> {
  elements: Array<string>;
}
export interface CcKvKeyValueSet extends CcKvKey<'set'> {
  elements: Array<string>;
}

export interface CcKvKeyValueHashElement {
  field: string;
  value: string;
}

//-- detail state ---

export type CcKvExplorerDetailState =
  | CcKvExplorerDetailStateHidden
  | CcKvExplorerDetailStateUnsupported
  | CcKvExplorerDetailStateAdd
  | CcKvExplorerDetailStateEdit;

export interface CcKvExplorerDetailStateHidden {
  type: 'hidden';
}

export interface CcKvExplorerDetailStateUnsupported {
  type: 'unsupported';
  key: CcKvKey;
}

export interface CcKvExplorerDetailStateAdd {
  type: 'add';
  formState: CcKvExplorerKeyAddFormState;
}

export interface CcKvExplorerKeyAddFormState {
  type: 'idle' | 'adding';
  errors?: {
    keyName?: 'already-used';
  };
}

//-- edit state ---

interface GenericCcKvExplorerDetailStateEdit<T extends CcKvKeyType, E> {
  type: `edit-${T}`;
  key: CcKvKey<T>;
  editor: E;
}

export type CcKvExplorerDetailStateEdit =
  | CcKvExplorerDetailStateEditString
  | CcKvExplorerDetailStateEditHash
  | CcKvExplorerDetailStateEditList
  | CcKvExplorerDetailStateEditSet;

export type CcKvExplorerDetailStateEditString = GenericCcKvExplorerDetailStateEdit<'string', CcKvKeyStringEditorState>;
export type CcKvExplorerDetailStateEditHash = GenericCcKvExplorerDetailStateEdit<'hash', CcKvHashExplorerState>;
export type CcKvExplorerDetailStateEditList = GenericCcKvExplorerDetailStateEdit<'list', CcKvListExplorerState>;
export type CcKvExplorerDetailStateEditSet = GenericCcKvExplorerDetailStateEdit<'set', CcKvSetExplorerState>;
