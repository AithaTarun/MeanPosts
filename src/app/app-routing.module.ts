/*
Used to manage angular routes.
 */

import {RouterModule, Routes} from '@angular/router';
import {PostListComponent} from './posts/post-list/post-list.component';
import {PostCreateComponent} from './posts/post-create/post-create.component';
import {NgModule} from '@angular/core';
import {AuthGuard} from './auth/auth.guard';

const routes : Routes =
  [
    {
      path : '', // Main/root page
      component : PostListComponent
    },
    {
      path : 'create',
      component : PostCreateComponent,
      canActivate :
      [
        AuthGuard
      ]
    },
    {
      path : 'edit/:postId',
      component : PostCreateComponent,
      canActivate :
        [
          AuthGuard
        ]
    },

    //Below defined routes will be loaded lazily.
    {
      path : 'auth',
      loadChildren : ()=> import('./auth/auth.module').then(module=> module.AuthModule)
    }
  ];

@NgModule
(
  {
    imports : [RouterModule.forRoot(routes)],
    exports : [RouterModule], //By this we could this router module with our router configuration outside of this app module.
    providers : [AuthGuard]
  }
)

export class AppRoutingModule
{

}
