import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, NgForm, Validators} from '@angular/forms';
import {PostsService} from '../posts.service';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {Post} from '../post.model';
import {mimeType} from './mime-type.validator';
import {Subscription} from 'rxjs';
import {AuthService} from '../../auth/auth.service';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})

export class PostCreateComponent implements OnInit,OnDestroy
{
  enteredTitle='';
  enteredContent = '';

  constructor(public postsService:PostsService, public route : ActivatedRoute, private authService : AuthService)
  {

  }

  private mode = 'create';
  private postId : string;
  post : Post;

  isLoading =false;

  //Below code is implemented after using reactive forms.
  form : FormGroup;

  private authStatisSubscription : Subscription;

  ngOnInit()
  {
    this.authStatisSubscription = this.authService.getAuthStatusListener().subscribe
    (
      (authStatus)=>
      {
        this.isLoading = false;
      }
    );

    //Below form initialization is after using reactive forms.
    this.form = new FormGroup
    (
      {
        'title' : new FormControl
        (
          null,
          {
            validators :
              [
                Validators.required,
                Validators.minLength(3)
              ],
            updateOn : 'change' //By default is 'change' only.
          }
        ),

        'content' : new FormControl
        (
          null,
          {
            validators :
            [
              Validators.required
            ]
          }
        ),

        'image' : new FormControl
        (
          null,
          {
            validators :
              [
                Validators.required
              ],
            asyncValidators :
            [
              mimeType
            ]
          }
        )
      }
    );

    this.route.paramMap.subscribe
    (
      (paramMap:ParamMap)=> //This will be called whenever parameter values are changed.
      {
        if (paramMap.has('postId'))
        {
          //So, if this is present then we are in edit mode with this component.
          //If not present then we are in create mode.
          this.mode='edit';
          this.postId=paramMap.get('postId');

          this.isLoading=true; //Going to fetch data.

          this.postsService.getPost(this.postId)
            .subscribe
            (
              (postData)=>
              {
                this.isLoading=false; //Received data.

                this.post =
                  {
                    id : postData._id,
                    title : postData.title,
                    content : postData.content,
                    imagePath : postData.imagePath,
                    creator : postData.creator
                  };

                //Populate form controls with data.
                this.form.setValue
                (
                  {
                    'title' : this.post.title,
                    'content' : this.post.content,
                    image : this.post.imagePath
                  }
                );

              }
            );
        }
        else
        {
          this.mode='create';
          this.postId = null;
        }
      }
    )
  }

  //onSavePost(postForm:NgForm) //Commented after using reactive forms
  onSavePost()
  {

    //if (postForm.invalid) //After reactive forms
    if (this.form.invalid)
    {
      return;
    }

    this.isLoading=true;

    if (this.mode==='create')
    {
      //this.postsService.addPost(postForm.value.titleInput,postForm.value.contentInput); //After reactive forms
      this.postsService.addPost(this.form.value.title,this.form.value.content, this.form.value.image);
    }
    else
    {
      //this.postsService.updatePost(this.postId,postForm.value.titleInput,postForm.value.contentInput); //After reactive form
      this.postsService.updatePost(this.postId,this.form.value.title,this.form.value.content, this.form.value.image);
    }

   //postForm.resetForm(); //After reactive forms
    this.form.reset();

  }

  imagePreview : string;

  onImagePicked(event:Event)
  {
    const file = (event.target as HTMLInputElement).files[0];

    //Now store that in a new form control.

    this.form.patchValue // patchValue allows us to target a single control.
    (
      {
        'image' : file
      }
    );

    this.form.get('image').updateValueAndValidity(); //This informs Angular that user changed the value, and re-evaluate that.

    //File -> Image to be displayed.
    const reader = new FileReader();
    reader.onload =
      ()=>
      {
        this.imagePreview = (reader.result as string);
      };
    reader.readAsDataURL(file);
  }

  ngOnDestroy()
  {
    this.authStatisSubscription.unsubscribe();
  }

}
