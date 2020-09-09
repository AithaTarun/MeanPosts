import {Component, OnDestroy, OnInit} from '@angular/core';
import {PostsService} from '../posts.service';
import {Post} from '../post.model';
import {Subscription} from 'rxjs';
import {PageEvent} from '@angular/material/paginator';
import {AuthService} from '../../auth/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit,OnDestroy
{
  posts =
    [
      /*{
        title : 'Post 1',
        content : 'Post one content'
      },
      {
        title : 'Post 2',
        content : 'Post two content'
      },
      {
        title : 'Post 3',
        content : 'Post three content'
      }*/
    ];

  isLoading = false;

  totalPosts = 0;
  postsPerPage = 2;
  currentPage = 1;
  pageSizeOptions =
    [
      1,2,5,10
    ];

  constructor(public postsService:PostsService, private authService:AuthService)
  {

  }

  private postsSubscription : Subscription;
  private authStatusSubscription : Subscription;

  public userIsAuthenticated = false;

  userId : string;

  ngOnInit()
  {
    this.isLoading=true;

    //Basic initialization tasks.
    this.postsService.getPosts(this.postsPerPage,this.currentPage);

    this.userId=this.authService.getUserId();

    this.postsSubscription=this.postsService.getPostUpdateListener()
      .subscribe
    (
      (postData:{posts : Post[],postCount: number})=> //This function gets executed when new data is received.
      {
        this.isLoading=false;
        this.totalPosts=postData.postCount;
        this.posts=postData.posts;
      }
    );

    this.userIsAuthenticated = this.authService.getIsAuth();

    this.authStatusSubscription = this.authService.getAuthStatusListener()
      .subscribe
      (
        (isAuthenticated)=>
        {
          this.userIsAuthenticated=isAuthenticated;
          this.userId=this.authService.getUserId();
        }
      )
  }

  onDelete(postId:string)
  {
    this.isLoading=true;

    this.postsService.deletePost(postId)
      .subscribe //Subscribed after pagination
      (
        ()=>
        {
          this.postsService.getPosts(this.postsPerPage,this.currentPage);
        },
        ()=> //To get informed about errors
        {
          this.isLoading = false;
        }
      );
  }

  onChangedPage(pageDataEvent:PageEvent)
  {
    this.isLoading=true;

    this.currentPage = pageDataEvent.pageIndex + 1;
    this.postsPerPage = pageDataEvent.pageSize;

    this.postsService.getPosts(this.postsPerPage,this.currentPage);
  }

  ngOnDestroy()
  {
    this.postsSubscription.unsubscribe();

    this.authStatusSubscription.unsubscribe();
  }

}
