import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-discount',
  templateUrl: './discount.component.html',
  styleUrl: './discount.component.scss'
})
export class DiscountComponent {
  show = this.getIsDiscount() !== 'false' ? true : false;
  @Input('designDetail') designDetail:any;
  closeDiscount(){
    this.show=false;
    localStorage.setItem('isDiscount','false');
  }
  getIsDiscount(){
    return localStorage.getItem('isDiscount');
  }
}
