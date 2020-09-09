import {Component, OnDestroy, OnInit} from '@angular/core';
import {NgForm} from '@angular/forms';
import {AuthService} from '../auth.service';
import {Subscription} from 'rxjs';

@Component
({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit,OnDestroy
{
  public isLoading = false;

  constructor(public authService : AuthService)
  {

  }

  private authStatusSubscription : Subscription;

  ngOnInit()
  {
    this.authStatusSubscription = this.authService.getAuthStatusListener()
      .subscribe
      (
        (authStatus)=>
        {
          //This authStatus is used to handle the load spinner.
          this.isLoading=false;
        }
      )
  }

  onSignup(form : NgForm)
  {
    if (form.invalid)
    {
      return;
    }

    this.isLoading = true;

    this.authService.createUser(form.value.email,form.value.password);
  }

  ngOnDestroy()
  {
    this.authStatusSubscription.unsubscribe();
  }

}
