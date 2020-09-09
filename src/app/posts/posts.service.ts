import {Post} from './post.model';
import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Router} from '@angular/router';

import {environment} from '../../environments/environment';

const BACKEND_URL = environment.apiURL+"/posts/";

@Injectable({providedIn:"root"}) //By this Angular will create one instance of the service for the entire app.
export class PostsService
{

  constructor(private http:HttpClient,private router:Router)
  {

  }

  private posts : Post[] = [];
  private postsUpdated = new Subject<{posts : Post[],postCount:number}>();

  getPosts(postsPerPage : number,currentPage : number)
  {
    const queryParameters  = `?pageSize=${postsPerPage}&page=${currentPage}`;

    //Here fetch posts from server.
    this.http.get<{message:string,posts: any,maxPosts:number}>(BACKEND_URL + queryParameters)
      .pipe //Used to add multiple operators.
      (
        map //Used to convert he data which comes thorough this observable. Here to id -> _id
        (
          (postData)=> //Executes for every data that makes it through this observable.
          {
            return {
            posts : postData.posts.map //This is JS map.
              (
                (post) =>
                {
                  return {
                    id: post._id,
                    title: post.title,
                    content: post.content,
                    imagePath: post.imagePath,
                    creator : post.creator
                  }
                }
              ),
              maxPosts : postData.maxPosts
          }
          }
        )
      )
      .subscribe
      (
        (transformedPostData)=>
        {
          this.posts=transformedPostData.posts;
          this.postsUpdated.next
          (
            {
              posts : [...this.posts],
              postCount : transformedPostData.maxPosts
            }
            );
        }
      );
  }

  addPost(title:string,content:string, image : File)
  {
    /*const post:Post = {id:null,title,content};*/ //Commented after sending image to server.

    const postData = new FormData();
    postData.append('title',title);
    postData.append('content',content);
    postData.append('image', image,title);

    this.http.post<{message:string,post : Post}>
    (
      BACKEND_URL,
      //post //Commented after sending image data.
      postData
    )
      .subscribe
      (
        (response)=>
        {
          /*
          const post :Post =
            {
              id : response.post.id,
              title : title,
              content : content,
              imagePath : response.post.imagePath
            };

          console.log(response.message);

          /!*const id = response.post.id;

          post.id=id;*!/

          this.posts.push(post);
          this.postsUpdated.next([...this.posts]);
          */ //Removed after using pagination

          this.router.navigate(['/']);
        }
      );
  }

  deletePost(postId:string)
  {
    return this.http.delete(`${BACKEND_URL}${postId}`) //Returned after pagination.
      /*.subscribe
      (
        ()=>
        {
          console.log('Post deleted');

          const updatedPosts = this.posts.filter
          (
            (post)=>
            {
              return post.id !== postId;
            }
          );

          this.posts=updatedPosts;

          this.postsUpdated.next(this.posts); //To notify whole app about data updation.
        }
      );*/ //Commented after using pagination.

  }

  getPostUpdateListener()
  {
    return this.postsUpdated.asObservable();
  }

  getPost(id:string)
  {
    return this.http.get<{_id:string,title:string,content:string, imagePath : string,creator:string}>(`${BACKEND_URL}${id}`);
  }

  updatePost(id:string,title:string,content:string,image : File | string)
  {

    /*const post : Post =
      {
        id : id,
        title : title,
        content : content,
        imagePath : null
      };*/ //Commented after using images.

    let postData : Post | FormData;

    if (typeof (image) === 'object')
    {
      postData = new FormData();

      postData.append('id',id);
      postData.append("title",title);
      postData.append("content",content);
      postData.append("image",image,title);
    }
    else
    {
      //string image path
      postData=
        {
          id,
          title,
          content,
          imagePath : image,
          creator : null
        }
    }

    this.http
      .put
    (
      `${BACKEND_URL}${id}`,
      //post
      postData
    )
      .subscribe
      (
        (response)=>
        {
          /*
          const updatedPosts = [...this.posts];

          const oldPostIndex = updatedPosts.findIndex
          (
            (p)=>
            {
              /!*return p.id===post.id;*!/
              return p.id === id
            }
          );

          const post : Post =
            {
              id,
              title,
              content,
              imagePath : ""//response.imagePath
            }; //Added after using images

          updatedPosts[oldPostIndex]=post;

          this.posts=updatedPosts;

          this.postsUpdated.next([...this.posts]);
          */ //Commented after using pagination

          this.router.navigate(['/']);
        }
      );
  }


}
