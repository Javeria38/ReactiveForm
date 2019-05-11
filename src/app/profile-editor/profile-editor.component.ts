import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface Post {
  firstName: string;
  lastName: string;
  email: string;
}

@Component({
  selector: 'app-profile-editor',
  templateUrl: './profile-editor.component.html',
  styleUrls: ['./profile-editor.component.css']
})
export class ProfileEditorComponent implements OnInit {
  profileForm: FormGroup;

  postsCol: AngularFirestoreCollection<Post>;
  posts: any;

  firstName: string;
  lastName: string;
  email: string;

  postDoc: AngularFirestoreDocument<Post>;
  post: Observable<Post>;
  clicked = false;
success=false;
  bool = true;

  docID = new FormControl();


  constructor(private fb: FormBuilder, private afs: AngularFirestore) { }

  ngOnInit() {
    this.profileForm = this.fb.group({
      index: [{ value: null, disabled: true }],
      firstName: ['', [Validators.required,
      Validators.minLength(4)]
      ],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
    });
    this.postsCol = this.afs.collection('post2');
    this.posts = this.postsCol.snapshotChanges()
      .pipe(map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Post;
        const id = a.payload.doc.id;
        return { id, ...data };
      })));
  }

  addPost() {
    let index = this.profileForm.getRawValue().index
    if (index != null) {
      this.posts[index] = this.profileForm.value
    } else {
      const formValue = this.profileForm.value;
      this.afs.collection('post2').add(formValue);
    }
    this.profileForm.reset() // reset form to empty
  }


  editIndex = null;

  clickEdit(i) {
    this.clicked = !this.clicked;
    this.editIndex = i;
  }

  userEdit(post, i, docID) {
    this.bool = false;
    this.profileForm.setValue({
      index: i,
      firstName: post.firstName,
      lastName: post.lastName,
      email: post.email,
    });
    this.docID.setValue(docID);
  }

  editPost() {
    const formValue = this.profileForm.value;
    this.afs.collection('post2').doc(this.docID.value).update(formValue);
    this.docID.setValue('');
    this.bool = true;
    this.profileForm.reset() // reset form to empty
  }

  deletePost(postId) {
    this.afs.doc('post2/' + postId).delete();
  }

}
