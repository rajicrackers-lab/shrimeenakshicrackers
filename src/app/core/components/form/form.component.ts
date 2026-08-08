import { Component, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent {
  contactForm!: FormGroup;
  contactLoading=false;
  isSubmitted=false;
  states = [
    {'value': 'TN', 'name': 'Tamil Nadu'},
    {'value': 'KL', 'name': 'Kerala'},
    {'value': 'KA', 'name': 'Karnataka'},
    {'value': 'AP', 'name': 'Andhra Pradesh'},
    {'value': 'PY', 'name': 'Puducherry'},
]
  district: {[key:string]:string[]}= {TN:[
    'Ariyalur',
    'Chengalpattu',
    'Chennai',
    'Coimbatore',
    'Cuddalore',
    'Dharmapuri',
    'Dindigul',
    'Erode',
    'Kallakurichi',
    'Kanchipuram',
    'Kanyakumari',
    'Karur',
    'Krishnagiri',
    'Madurai',
    'Nagapattinam',
    'Namakkal',
    'Nilgiris',
    'Perambalur',
    'Pudukkottai',
    'Ramanathapuram',
    'Ranipet',
    'Salem',
    'Sivaganga',
    'Tenkasi',
    'Thanjavur',
    'Theni',
    'Thiruvallur',
    'Thiruvarur',
    'Thoothukudi',
    'Tiruchirappalli',
    'Tirunelveli',
    'Tirupattur',
    'Tiruppur',
    'Tiruvannamalai',
    'Vellore',
    'Viluppuram',
    'Virudhunagar'
  ],
KL:["Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam", "Idukki", "Ernakulam",
"Thrissur", "Palakkad", "Malappuram", "Kozhikode", "Wayanad", "Kannur", "Kasaragod"],
KA:["Bengaluru Urban", "Bengaluru Rural", "Mysuru", "Mangaluru", "Udupi", "Belagavi", "Dharwad",
"Hubballi", "Ballari", "Kalaburagi", "Bidar", "Vijayapura", "Chikmagalur", "Shivamogga"],
AP:["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Kadapa", "Anantapur",
"Chittoor", "Prakasam", "East Godavari", "West Godavari", "Srikakulam", "Vizianagaram"],
PY:["Puducherry", "Karaikal", "Mahe", "Yanam"]};
  @Output() formSubmitted = new EventEmitter<any>();
  constructor( _snackBar: MatSnackBar,private router:Router) { }
  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.contactForm = new FormGroup({
      email: new FormControl(null, [Validators.email]),
      name: new FormControl(null),
      state:new FormControl('TN'),
      phone:new FormControl(null,[Validators.required, Validators.pattern(/^[0-9]{10}$/)]),
      status: new FormControl('unpaid'),
      district: new FormControl(null,Validators.required),
      address: new FormControl(null, Validators.required),
      createdAt: new FormControl(new Date())
    })
  }
  contactSubmit() {
    if (this.contactForm.valid && this.contactForm.touched) {
      this.isSubmitted=true;
        this.formSubmitted.emit(this.contactForm.value)
        this.isSubmitted=false
        this.contactForm.reset();
        this.contactForm.patchValue({state:'Tamil Nadu', createdAt:new Date(), status:'unpaid'});
        Object.keys(this.contactForm.controls).forEach(key => {
          this.contactForm.controls[key].setErrors(null);
          this.contactForm.controls[key].markAsPristine();
          this.contactForm.controls[key].markAsUntouched();
        });
    }
    else {
      this.contactForm.markAllAsTouched()
    }
  }
}
