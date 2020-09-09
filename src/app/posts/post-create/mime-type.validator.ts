/*
This have task to get value of a control, which will be a file.
And read that file again with file reader and check for mime type of that file.
 */
import {AbstractControl} from '@angular/forms';
import {Observable, Observer, of} from 'rxjs';

export const mimeType = (control:AbstractControl) : Promise<{[key:string] : any}> | Observable<{[key:string] : any}> =>
{
  /*
  Here, [] does not mean an array.
  They indicate that it is really dynamic, a dynamic property name.
   */

  if (typeof (control.value) === 'string')
  {
    return of(null);
  }

  const file = control.value as File;

  const fileReader = new FileReader();

  const fileReaderObservable = new Observable
  (
    (observer : Observer<{[key:string] : any}>)=>
    {
      fileReader.addEventListener
      (
        'loadend',
        ()=>
        {
          const array = new Uint8Array(fileReader.result as ArrayBuffer).subarray(0,4);

          let header = '';
          let isValid = false;

          for (let i = 0; i<array.length; i++)
          {
            header += array[i].toString(16); //To Hexadecimal.
          }

          switch (header)
          {
            case "89504e47":
            {
              isValid = true;
              break;
            }
            case "ffd8ffe0":
            case "ffd8ffe1":
            case "ffd8ffe2":
            case "ffd8ffe3":
            case "ffd8ffe8":
              isValid = true;
              break;
            default:
              isValid = false; // Or you can use the blob.type as fallback
              break;
          }

          if (isValid)
          {
            observer.next(null);
          }
          else
          {
            observer.next({invalidMimeType : true});
          }
          observer.complete();
        }
      );

      fileReader.readAsArrayBuffer(file);
    }
  );

  return fileReaderObservable;
}
