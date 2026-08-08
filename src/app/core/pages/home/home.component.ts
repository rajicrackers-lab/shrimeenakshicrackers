import { Component, TemplateRef, ViewChild, Renderer2, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { ApiService } from '../../services/api.service';
import { ProductsComponent } from '../../components/products/products.component';
import { CommonService } from '../../services/common.service';
import { fromEvent, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  selectedItems!: any[];
  totalPrice: any;
  isOffer = false;
  status = 'pending'
  @ViewChild('drawer') drawer!: MatSidenav;
  @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<any>;
  @ViewChild('success') successTemplate!: TemplateRef<any>;
  @ViewChild(ProductsComponent) productComponent!: ProductsComponent;
  couponArray!: any[];
  couponAmount = 0;
  couponCode: any;
  isErrorScreen = false;
  private unsubscriber: Subject<void> = new Subject<void>();
  constructor(public dialog: MatDialog, private apiService: ApiService, private commonService: CommonService, private renderer: Renderer2, private cdr: ChangeDetectorRef) {
  }
  showSelectedProduct(products: any) {
    this.couponAmount = products?.coupon?.amount ?? 0;
    this.couponCode = products?.coupon;
    this.isOffer = products?.isOffer
    this.selectedItems = products.items
    this.totalPrice = products.total;
    this.drawer.open();
    this.preventBackNavigation()
  }
  isLoading = false;
  designDetail: any;
  ngOnInit(): void {
    this.isLoading = true;
    this.isErrorScreen = false;
    this.apiService.getData('details').then((res) => {
      this.designDetail = res && res.data && res.data[0];
      this.isLoading = false;
      document.title = this.designDetail?.pageTitle;
      this.commonService.designDetail.next(this.designDetail);
      document.documentElement.style.setProperty('--primary-color', this.designDetail?.primaryColor ?? '#4caf4f', 'important');
      document.documentElement.style.setProperty('--secondary-color', this.designDetail?.secondaryColor ?? '#b3dbb4', 'important');
      const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim(); // Trim to remove unwanted spaces
      this.cdr.detectChanges();
    }).catch((err) => {
      this.isErrorScreen = true;
      console.error('Error occurred:', err);
      this.isLoading = false;
    })
  }

  onClose() {
    this.drawer.close()
    this.commonService.showFabIcons.next(true);
    this.unlistenBackNavigation()
  }
  getTotal(): number {
    if (this.selectedItems) {
      return this.selectedItems.reduce((acc: any, item: any) => acc + item.price, 0);
    }
    else {
      return 0;
    }
  }
  getDiscountPrice(value: number) {
    return (value * (this.designDetail?.percentage ? this.designDetail.percentage : 70)) / 100
  }
  onOrder() {
    if (this.totalPrice >= (this.designDetail?.minimumPurchase ?? 4000)) {
      // const dialogRef = this.dialog.open(this.dialogTemplate, {
      //   width: '400px',
      // });
      this.onClose();
    } else {
      alert(`Minimum order above ₹ ${this.designDetail?.minimumPurchase ?? 4000} /-`)
    }
  }
  // checkCoupon(searchString: string) {
  //   let couponapplied=false;
  //   if (!this.couponArray) {
  //     this.apiService.getAllData('coupon').subscribe((res) => {
  //       this.couponArray = res
  //       for(let i=0;i<this.couponArray.length;i++){
  //         if (this.couponArray[i].code === searchString && this.couponArray[i].amount) {
  //           this.applyCoupont= this.couponArray[i].amount;
  //           couponapplied=true;
  //           // this.triggerConfetti()
  //           this._snack.open(`Coupon for ₹${this.couponArray[i].amount} applied`,'ok',{duration:3000})
  //       }
  //       if(!couponapplied){
  //         this._snack.open("Coupon expired or invalid",'ok',{duration:3000})
  //       }
  //       }
  //     })
  //   }
  //   else{
  //     for(let i=0;i<this.couponArray.length;i++){
  //       if (this.couponArray[i].code === searchString && this.couponArray[i].amount) {
  //         this.applyCoupont= this.couponArray[i].amount;
  //         couponapplied=true;
  //         // this.triggerConfetti()
  //         this._snack.open(`Coupon for ₹${this.couponArray[i].amount} applied`,'ok',{duration:3000})
  //     }
  //     }
  //     if(!couponapplied){
  //       this._snack.open("Coupon expired or invalid",'ok',{duration:3000})
  //     }
  //   }
  // }
  preventBackNavigation() {
    history.pushState(null, '');

    fromEvent(window, 'popstate').pipe(
      takeUntil(this.unsubscriber)
    ).subscribe((_) => {
      history.pushState(null, '');
      this.onClose()
    });
  }
  unlistenBackNavigation() {
    this.unsubscriber.next();
    this.unsubscriber.complete();
  }
  onPlaceOrder(event: any) {
    const data = event;
    data.couponAmount = this.couponAmount ?? 0;
    data.couponCode = this.couponCode?.code ?? '';
    data.items = this.selectedItems;
    data.totalAmount = this.isOffer ? (((this.totalPrice - this.getDiscountPrice(this.totalPrice)) - this.designDetail?.offerAmount) - this.couponAmount) : ((this.totalPrice - this.getDiscountPrice(this.totalPrice)) - (this.couponAmount ?? 0));
    this.dialog.closeAll()
    this.dialog.open(this.successTemplate, {
      width: '400px',
    });
    this.apiService.addSupaData('orders', data).then((res) => {
      if (this.couponCode && this.couponCode.code) {
        this.couponCode['count'] = this.couponCode.count ? (this.couponCode.count + 1) : 1;
        this.apiService.updateSupaData('coupon', { column: 'id', value: this.couponCode?.id }, { count: this.couponCode?.count })
      }
      this.status = 'success'
      this.apiService.sendEmail(event).then(() => {
        // console.log();
      })
      this.dialog.afterAllClosed.subscribe(() => {
        this.couponAmount = 0;
        this.isOffer = false;
        this.selectedItems = []
        this.totalPrice = 0;
        this.productComponent.resetAll();
      })
    }).catch((err) => {
      this.status = 'failed'
      alert("Oops error occured!")
    })
  }
  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.unlistenBackNavigation()
  }
}
