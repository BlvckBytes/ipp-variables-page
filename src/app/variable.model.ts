import { Searchable } from './searchable.interface';

export interface Variable {
  displayName: Searchable;
  materialDisplayNames: Searchable[];
  // Blocked materials are never searched for, because they are *not* part of the variable's effective materials.
  blockedMaterialDisplayNames: string[];
  inheritedMaterialDisplayNames: Searchable[];
  parentDisplayNames: Searchable[];
}