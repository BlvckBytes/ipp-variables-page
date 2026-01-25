import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguagePicker } from './components/language-picker/language-picker';
import { Language } from './language.model';
import { VariablesApiService } from './variables-api.service';
import { BehaviorSubject, filter } from 'rxjs';
import { Variable } from './variable.model';
import { Searchable } from './searchable.interface';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  imports: [CommonModule, LanguagePicker]
})
export class App {

  @ViewChild('query') query?: ElementRef<HTMLInputElement>;

  allVariables$ = new BehaviorSubject<Variable[]>([]);
  variables$ = new BehaviorSubject<Variable[]>([]);

  constructor(private apiService: VariablesApiService) {
    this.allVariables$.subscribe(variables => {
      this.variables$.next(variables);
    });
  }

  selectedLanguage(language: Language) {
    this.apiService.getVariables(language).subscribe(variables => {
      this.allVariables$.next(variables);
    });
  }

  sanitizeDisplayName(displayName: string): string {
    return displayName
      .replace(/[%,]/g, '')
      .replace(/-/g, '_')
      .replace(/\s+/g, '_')
      .toLowerCase();
  }

  private getSearchables(variable: Variable): Searchable[] {
    return [variable.displayName, ...variable.materialDisplayNames, ...variable.inheritedMaterialDisplayNames, ...variable.parentDisplayNames];
  }

  onSearch() {
    let query = this.query?.nativeElement?.value?.trim();

    if (!query) {
      for (let variable of this.allVariables$.value)
        this.getSearchables(variable).forEach(searchable => searchable.highlighted = false);

      this.variables$.next(this.allVariables$.value);
      return;
    }

    let filtered: Variable[] = [];
    let keywords = query.split(' ').map(k => k.toLowerCase());

    for (let variable of this.allVariables$.value) {
      let matchedKeywords: string[] = [];
      let searchables = this.getSearchables(variable);

      var mismatchLengths: { [key: string]: number } = {};

      for (let searchable of searchables) {
        searchable.highlighted = false;

        for (var keyword of keywords) {
          var lowerContent = searchable.content.toLowerCase();

          if (lowerContent.indexOf(keyword) < 0)
            continue;

          if (!(lowerContent in mismatchLengths))
            mismatchLengths[lowerContent] = lowerContent.length;

          mismatchLengths[lowerContent] = Math.max(0, mismatchLengths[lowerContent] - keyword.length);

          searchable.highlighted = true;

          if (!matchedKeywords.includes(keyword))
            matchedKeywords.push(keyword);
        }
      }

      let remainingKeywords = keywords.filter(k => !matchedKeywords.includes(k));

      if (remainingKeywords.length !== 0)
        continue;

      filtered.push(variable);
      (variable as any)._mismatchLength = Object.values(mismatchLengths).reduce((a, b) => Math.min(a, b), Number.MAX_SAFE_INTEGER);
    }

    // Try to offer most relevant results first
    filtered.sort((a, b) => (a as any)._mismatchLength - (b as any)._mismatchLength);

    this.variables$.next(filtered);
  }
}
