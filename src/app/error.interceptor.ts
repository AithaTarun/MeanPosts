/*
This file is to handle all global errors of the app. After getting response from server.
 */

import {HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {ErrorComponent} from './error/error.component';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor
{
  constructor(private dialog : MatDialog)
  {

  }

  intercept(request:HttpRequest<any>, next : HttpHandler)
  {
    return next.handle(request)
      .pipe
      (
        catchError //Used to handle errors emitted in this stream. Here they will be Http Errors.
        (
          (error : HttpErrorResponse)=>
          {
            let errorMessage = 'An unknown error occurred';

            if (error.error.message)
            {
              errorMessage = error.error.message;
            }

            this.dialog.open
            (
              ErrorComponent,
              {
                data : //This allows us to pass in an object which represents the data we want to work in the error component.
                  {
                    message : errorMessage
                  }
              }
            );

            return throwError(error); //This generates new observable to which we pass that error.
          }
        )
      )

    /*
    handle gives us the response observable stream.
    So, we can hook into that stream and listen to events and can use the pipe method to
    add an operator to that stream.
     */
  }

}
