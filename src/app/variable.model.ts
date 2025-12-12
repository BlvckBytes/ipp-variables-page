import { Searchable } from './searchable.interface';

export interface Variable {
  displayName: Searchable;
  materialDisplayNames: Searchable[];
  inheritedMaterialDisplayNames: Searchable[];
  parentDisplayNames: Searchable[];
}