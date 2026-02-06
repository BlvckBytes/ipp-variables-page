import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Language } from './language.model';
import { Variable } from './variable.model';
import { Searchable } from './searchable.interface';

@Injectable({
  providedIn: 'root',
})
export class VariablesApiService {

  baseUrl: string;

  constructor(private httpClient: HttpClient) {
    this.baseUrl = window.location.hostname;

    if (this.baseUrl === 'localhost')
      this.baseUrl = "http://" + this.baseUrl + ":8150";
    else
      this.baseUrl = "https://" + this.baseUrl + "/api";
  }

  public getLanguages(): Observable<Language[]> {
    return this.httpClient.get(this.baseUrl + '/languages')
    .pipe(map((body: any) => {
        return body.map((lang: any) => ({
          displayName: lang.displayName,
          enumName: lang.enumName,
          selected: false
        }));
    }));
  }

  public getVariables(language: Language): Observable<Variable[]> {
    return this.httpClient.get(this.baseUrl + '/variables?language=' + language.enumName)
    .pipe(map((body: any) => {
        return body.map((variable: any) => ({
          displayName: this.mapToSearchable(variable.displayName),
          materialDisplayNames: this.mapToSearchables(variable.materialDisplayNames),
          blockedMaterialDisplayNames: variable.blockedMaterialDisplayNames,
          inheritedMaterialDisplayNames: this.mapToSearchables(variable.inheritedMaterialDisplayNames),
          parentDisplayNames: this.mapToSearchables(variable.parentDisplayNames)
        }));
    }));
  }

  private mapToSearchables(values: string[]): Searchable[] {
    return values.map(this.mapToSearchable);
  }

  private mapToSearchable(value: string): Searchable {
    return ({
      content: value,
      highlighted: false
    });
  }
}
