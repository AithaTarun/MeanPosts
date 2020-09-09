import {NgModule} from '@angular/core';
import {LoginComponent} from './login/login.component';
import {SignupComponent} from './signup/signup.component';
import {RouterModule, Routes} from '@angular/router';

const routes : Routes = //This is for achieving lazy loading.
  [
    {
      path : 'login',
      component : LoginComponent
    },
    {
      path : 'signup',
      component : SignupComponent
    }
  ]

@NgModule
(
  {
    imports :
    [
      RouterModule.forChild(routes) //This is for achieving lazy loading.
    ],
    exports :
    [
      RouterModule
    ]
  }
)
export class AuthRoutingModule
{

}
