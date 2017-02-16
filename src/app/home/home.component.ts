
import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { FormGroup, FormControl, Validators, FormBuilder }  from '@angular/forms';

import { ToastComponent } from '../shared/toast/toast.component';

import { DataService } from '../services/data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})



export class HomeComponent implements OnInit {

  files = [];
  data = [];
  isLoading = true;

  cat = {};
  isEditing = false;
  msg = "";
  msg_no_file = "";

  addCatForm: FormGroup;
  name = new FormControl('', Validators.required);
  age = new FormControl('', Validators.required);
  weight = new FormControl('', Validators.required);
  filesToUpload: Array<File>;

  constructor(private http: Http,
              private dataService: DataService) {
          this.filesToUpload = [];
  }

  ngOnInit() {
    this.getFiles();

   /* this.addCatForm = this.formBuilder.group({
      name: this.name,
      age: this.age,
      weight: this.weight,
    });*/
  }

  getFiles() {
    this.dataService.getFiles().subscribe(
      data => this.files = data,
      error => console.log(error),
      () => this.isLoading = false
    );
  }

  upload() {
    this.msg = "";
    this.msg_no_file = "";
    const formData:any = new FormData();
    const files:Array<File> = this.filesToUpload;
    if (files.length > 0) {
      formData.append("uploads[]", files[0], files[0]['name']);

      this.http.post('http://localhost:3000/upload', formData)
          .map(files => {
            if (files.json().error) {
              this.msg = files.json().error;
            }
            else {
              files.json();
            }
          })
          .subscribe(files => console.log('files', files));
      this.getFiles();
    }
    else {
      this.msg_no_file='Please select a file';
    }
  }

  fileChangeEvent(fileInput: any) {
    this.filesToUpload = <Array<File>>fileInput.target.files;
  }
}


