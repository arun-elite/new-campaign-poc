import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoginProviderService {

  constructor(private httpClient: HttpClient) {

  }

  public getToken(): void {
    let body = new HttpParams()
      .set('grant_type', 'password')
      //.set('username', 'usercmc@calix.com')
      //.set('password', 'calix123')
      .set('username', 'admin@calix.com')
      .set('password', 'admin')
      .set('client_secret', 'yyQB4GkG6mQO2fG8');

    let options = {
      headers: new HttpHeaders().set('X-Calix-ClientID', 'UcWGgUfH0guUPG2LkGVU5GbPAjhi22JO')
    };

    this.httpClient.post<TokenResponse>('https://stage.api.calix.ai/v1/authentication/token', body, options)
      .subscribe(result => {
        sessionStorage.setItem('access_token', result.access_token);
      });
  }
}

export interface TokenResponse {
  access_token: string,
}
