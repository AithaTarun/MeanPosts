import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthData} from './auth-data';
import {Subject} from 'rxjs';
import {Router} from '@angular/router';

import {environment} from '../../environments/environment';

const BACKEND_URL = environment.apiURL+"/user/"

@Injectable
(
  {
    providedIn : 'root'
  }
)
export class AuthService
{
  private token : string;
  private authStatusListener = new Subject<boolean>(); //Used to push authentication information.

  private isAuthenticated = false;

  private tokenTimer : any;

  private userId : string; //This is when userId received with auth token.

  constructor(private http:HttpClient, private router : Router)
  {

  }

  createUser(email:string,password:string)
  {
    const authData : AuthData = {email,password};

    return this.http
      .post
      (
        BACKEND_URL+'signup',
        authData
      )
      .subscribe
      (
        (response)=>
        {
          //console.log(response);
          this.router.navigate(['/']);
        },
        (error)=> //To handle error
        {
          this.authStatusListener.next(false);
        }
      );
  }

  login(email: string,password: string)
  {
    const authData : AuthData = {email,password};

    this.http
      .post<{token:string,userId:string,expiresIn:number}>
      (
        BACKEND_URL+'login',
        authData
      )
      .subscribe
      (
        (response)=>
        {
          this.token=response.token;
          if (this.token)
          {
            const expiresInDuration = response.expiresIn;
            this.setAuthTimer(expiresInDuration);

            this.authStatusListener.next(true);
            this.isAuthenticated = true;

            this.userId=response.userId;

            const now = new Date();
            const expirationDate = new Date(now.getTime()+expiresInDuration*1000);
            this.saveAuthData(this.token,expirationDate, this.userId);

            this.router.navigate(['/']);
          }
        },

        (error)=>
        {
          this.authStatusListener.next(false);
        }
      );
  }

  getUserId()
  {
    return this.userId;
  }

  getToken()
  {
    return this.token;
  }

  getAuthStatusListener()
  {
    return this.authStatusListener.asObservable();
    /*
    As observable because so we can't emit new values from other components,
    we only want to be able to emit from within the service but we want to be able to listen
    from other parts.
     */
  }

  getIsAuth()
  {
    return this.isAuthenticated;
  }

  logout()
  {
    this.token = null;
    this.isAuthenticated = false;

    this.authStatusListener.next(false);

    clearTimeout(this.tokenTimer);

    this.clearAuthData();

    this.userId=null; //Reset currently authenticated userId to null when user unauthenticated.

    this.router.navigate(['/']);
  }

  private saveAuthData(token : string,expirationDate : Date, userId:string)
  {
    localStorage.setItem('token',token);
    localStorage.setItem('expiration',expirationDate.toISOString());
    localStorage.setItem('userId',userId);
  }

  private clearAuthData()
  {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
  }

  autoAuthUser()
  {
    const authInformation = this.getAuthData();

    if (!authInformation)
    {
      return;
    }

    const now = new Date();

    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();

    if (expiresIn>0)
    {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.userId=authInformation.userId;
      this.setAuthTimer(expiresIn/1000);
      this.authStatusListener.next(true);
    }
  }

  private getAuthData()
  {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');

    if (!token || !expirationDate)
    {
      return;
    }

    return {
      token,
      expirationDate : new Date(expirationDate),
      userId
    }
  }

  private setAuthTimer(duration : number)
  {
    this.tokenTimer = setTimeout
    (
      ()=>
      {
        this.logout();
      },
      duration*1000 //Seconds -> Milliseconds.
    );
  }
}
