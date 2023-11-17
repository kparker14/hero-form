import {
  Component,
  ViewEncapsulation,
  OnInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  Validators,
  FormControl,
  ValidatorFn,
  ValidationErrors,
  AbstractControl
} from '@angular/forms';

import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-contact-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
  encapsulation: ViewEncapsulation.None
})
export class HeroFormComponent implements OnInit {

  //https://us6.api.mailchimp.com/3.0/ 
  // get the form inputs
  @ViewChild('contactForm') myFormVC!: FormGroup;
  @ViewChild('firstNameTemplateVariable') firstNameChildElement!: ElementRef;
  @ViewChild('lastNameTemplateVariable') lastNameChildElement!: ElementRef;
  @ViewChild('emailTemplateVariable') emailChildElement!: ElementRef;
  @ViewChild('commentTemplateVariable') commentChildElement!: ElementRef;

  public myForm!: FormGroup;
  public comment: FormControl;
  public lastName: FormControl;
  public firstName: FormControl;
  public email: FormControl;

  public submitted: boolean = false;
  public success: boolean = false;

  public myValue = "Dear Katherine, ";
  public value = "";
  public charactersCount: number;
  public counter: string;
  public maxlength = 1000;

  constructor() {

    this.firstName = new FormControl(null, [
      Validators.required,
      forbiddenNameValidator(/bob/i),
    ]);
    this.lastName = new FormControl(null, [Validators.required]);
    this.email = new FormControl(null, [Validators.required, Validators.email]);
    this.comment = new FormControl(null, [Validators.required]);

    this.myForm = new FormGroup({});

    this.myForm.addControl('firstName', this.firstName);
    this.myForm.addControl('lastName', this.lastName);
    this.myForm.addControl('email', this.email);
    this.myForm.addControl('comment', this.comment);
    //this.submitted = false;
  }

  ngOnInit(): void {
    this.comment.setValue(this.myValue);
    this.charactersCount = this.myValue ? this.myValue.length : 0;
    this.counter = `${this.charactersCount}/${this.maxlength}`;
  }

  public onReset() {
    console.log("onReset()");
    this.submitted = false;
    this.success = false;
  }

  onSubmit(e: any) {

    this.submitted = true;

    if (this.myForm.valid) {
      e.preventDefault();
      
     // this.submitted = true;
     this.sendMail(this.firstName.value, this.lastName.value, this.email.value, this.comment.value);
     this.success = true;
    } 
    else { 
      console.log("Form is invalid");
      this.success = false;
  }
  }

  public onValueChange(event: Event): void {

    let text = (event.target as HTMLInputElement).value
    this.charactersCount = text.length;
    this.counter = `${this.charactersCount}/${this.maxlength}`; 
  }

  sendMail(firstName: string, lastName: string, email: string, comment: string) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.set('Authorization', 'Basic ' + btoa('5bde5d6e463702f2e6737496315a1bb3'+":" +'674d0fac8b1b951435369385bbb866f4'));
  
    const data = JSON.stringify({
      "Messages": [{
        "From": {"Email": "<YOUR EMAIL>", "FirstName": "<YOUR NAME>"},
        "To": [{"Email": this.email.value, "Name": this.firstName.value + " " +  this.lastName.value}],
        "TextPart": this.comment.value
      }]
    });
  
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: data,
    };
  
    fetch("https://api.mailjet.com/v3.1/send", requestOptions)
      .then(response => response.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));
  }
  
  //sendMail('Test Name',"<YOUR EMAIL>",'Test Subject','Test Message')
}

export function forbiddenNameValidator(nameRe: RegExp): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const forbidden = nameRe.test(control.value);
    return forbidden ? { forbiddenName: { value: control.value } } : null;
  };
}
