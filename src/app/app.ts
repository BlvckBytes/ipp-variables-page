import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguagePicker } from './components/language-picker/language-picker';
import { Language } from './language.model';
import { VariablesApiService } from './variables-api.service';
import { BehaviorSubject } from 'rxjs';
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

      for (let searchable of searchables) {
        searchable.highlighted = false;

        for (var keyword of keywords) {
          if (searchable.content.toLowerCase().indexOf(keyword) >= 0) {
            searchable.highlighted = true;

            if (!matchedKeywords.includes(keyword))
              matchedKeywords.push(keyword);
          }
        }
      }

      let remainingKeywords = keywords.filter(k => !matchedKeywords.includes(k));

      if (remainingKeywords.length === 0)
        filtered.push(variable);
    }

    this.variables$.next(filtered);
  }
}
