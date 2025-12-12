import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Language } from '../../language.model';
import { CommonModule } from '@angular/common';
import { VariablesApiService } from '../../variables-api.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-language-picker',
  imports: [CommonModule],
  templateUrl: './language-picker.html',
  styleUrl: './language-picker.scss',
})
export class LanguagePicker implements OnInit {

  @Output() selectedLanguage = new EventEmitter<Language>();
  languages$ = new BehaviorSubject<Language[]>([]);

  constructor(private apiService: VariablesApiService) {}

  ngOnInit(): void {
    this.apiService.getLanguages().subscribe(langs => {
      let lastSelectedLanguage = window.localStorage.getItem("lastSelectedLanguage");

      for (let i = 0; i < langs.length; i++) {
        var lang = langs[i];

        lang.selected = lastSelectedLanguage === null ? i === 0 : langs[i].enumName === lastSelectedLanguage;

        if (lang.selected)
          this.selectedLanguage.emit(lang);
      }

      this.languages$.next(langs);
    });
  }

  selectLanguage(language: Language): void {
    for (const lang of this.languages$.value || []) {
      lang.selected = false;
    }

    language.selected = true;
    window.localStorage.setItem("lastSelectedLanguage", language.enumName);
    this.selectedLanguage.emit(language);
  }
}
