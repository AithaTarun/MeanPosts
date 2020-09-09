/*
This interceptor is used to attach token for every outgoing requests.
 */

import {HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {AuthService} from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor
{
  constructor(private authService:AuthService)
  {
  }

  intercept(request:HttpRequest<any>, next : HttpHandler)
  {
    const authToken = this.authService.getToken();

    const authRequest = request.clone
    (
      //Clone and edit that request.
      {
        headers : request.headers.set('Authorization',"Bearer "+authToken)
      }
    );


    return next.handle(authRequest);
  }

}
