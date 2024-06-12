import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'ReactFormProject';
  submitted = false;
  formData: any;

  frm = new FormGroup({
    name: new FormControl('', [Validators.required,Validators.pattern('^[a-zA-Z ]+$'),]),
    gender: new FormControl('', Validators.required),
    rollno:new FormControl('',[Validators.required,Validators.pattern('^[0-9]+[A-Za-z]+[0-9]+$'),]),
    dept: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone:new FormControl('',[Validators.required,Validators.pattern('^[0-9]{10}$'),]),
    
    isverified: new FormControl(false),
  });

  onSubmit() {
    if (this.frm.valid) {
      this.submitted = true;
      this.formData = this.frm.value;
    }
  }
}