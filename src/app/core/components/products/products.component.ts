import { Component, ElementRef, EventEmitter, HostListener, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '../../services/api.service';
import { cracker } from './crackers.constant';
import confetti from 'canvas-confetti';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonService } from '../../services/common.service';
import { FormControl } from '@angular/forms';
import { environment } from '../../../../environments/environment';
export interface Cracker {
  id: number;
  name: string;
  ogPrice: number;
  price: number;
  quantity: number;
  imageUrl?: string;
}

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent {
  @Input('designDetail') designDetail: any;
  @Output() emitDrawer = new EventEmitter<any>();
  isOfferApplied = false;
  isCrackerloaded = true;
  @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<any>;
  @ViewChild('success') successTemplate!: TemplateRef<any>;
  selectedCracker: any;
  couponCode: any;
  isSticky!: boolean;
  constructor(public dialog: MatDialog, private apiService: ApiService, public commonService: CommonService, private _snack: MatSnackBar) { }
  allCrackers: any[] = cracker;
  filteredCrackers!: any[];
  isLoading = false;
  status = 'pending';
  coupon = ''
  couponArray!: any;
  applyCouponValue = 0;
  referralCode: string = '';
  referralStatus: string = ''; // 'valid', 'invalid', 'pending'
  referralError: string = '';
  totalProfit: number = 0;
  showScrollBtn = true;
  showFabIcons = true;
  orderInfo!: any;
  searchText!: FormControl;
  toggleSearch = false;


  ngOnInit(): void {
    this.searchText = new FormControl('')
    // this.showFabIcons=this.commonService.showFabIcons.value;
    this.commonService.showFabIcons.subscribe((res: any) => {
      this.showFabIcons = res;
    })
    this.checkScrollPosition();
    this.isLoading = true;
    this.isCrackerloaded = false;
    const storedData = localStorage.getItem('allCrackers');
    if (storedData) {
      this.allCrackers = JSON.parse(storedData);
      this.isLoading = false;
    }
    this.apiService.fetchCategoriesWithProducts().then(res => {
      this.allCrackers = res;
      localStorage.setItem('allCrackers', JSON.stringify(this.allCrackers));
      this.isLoading = false;
      this.isCrackerloaded = true;
    }).catch(err => {
      console.log(err);
      this.isLoading = false;

    })
    // try {
    //   // const savedDate = localStorage.getItem('allCrackers_date');
    //   // const currentDate = new Date().toDateString();

    //   if (storedData) {
    //     // If data is stored and date matches, use the stored data
    //     this.allCrackers = JSON.parse(storedData);
    //     this.isLoading = false;
    //   }
    //   // Fetch new data from the API
    //   const categoryIds = await this.apiService.getAllCategoryIds();
    //   await this.apiService.getCrackersData(categoryIds).then((res) => {
    //     this.allCrackers = res;
    //     this.isLoading = false;
    //     this.isCrackerloaded = true;

    //   })
    //   // Store the new data and current date in localStorage
    //   localStorage.setItem('allCrackers', JSON.stringify(this.allCrackers));
    //   // localStorage.setItem('allCrackers_date', JSON.stringify(currentDate));
    // } catch (error) {
    //   console.error('Error fetching crackers data:', error);
    // }

  }

  totalQuantity: number = 0;
  totalPrice: number = 0;
  selectedItems: any[] = [];

  addQuantity(cracker: any): void {
    cracker.quantity = 1;
    this.updateTotals();
  }


  onValueChange(cracker: any, event: any): void {
    const value = event.target.value;
    if (value >= 0) {
      cracker.quantity = value;
      this.updateTotals();
    }
  }

  getTotalPrice(cracker: any): number {
    if (cracker.quantity > 0) {
      return (cracker.price - this.getDiscountPrice(cracker.price)) * cracker.quantity;
    }
    else {
      return 0;
    }
  }

  geOGtTotalPrice(cracker: any): number {
    return cracker.price * cracker.quantity;
  }
  
  getProfitPrice(cracker: any): number {
    const mrp = cracker.price || 0;
    const purchaseVal = cracker.purchase_val || 0;
    const discountPrice = this.getDiscountPrice(mrp);
    const sellingPrice = mrp - discountPrice;
    return (sellingPrice - purchaseVal) * (cracker.quantity || 0);
  }

  updateTotals(): void {
    this.totalQuantity = 0;
    this.totalPrice = 0;
    this.totalProfit = 0;
    this.selectedItems = [];

    for (const table of this.allCrackers) {
      for (const cracker of table.crackers) {
        if (cracker.quantity > 0) {
          cracker.offerPrice = cracker.price - this.getDiscountPrice(cracker.price);
          cracker.qtAmount = cracker.quantity * cracker.offerPrice;
          this.totalQuantity += cracker.quantity;
          this.totalPrice += this.geOGtTotalPrice(cracker);
          this.totalProfit += this.getProfitPrice(cracker);
          this.selectedItems.push({ ...cracker });
        }
      }
    }
    if (!(this.totalPrice - this.getDiscountPrice(this.totalPrice) >= (this.designDetail?.minimumPurchase ?? 4000))) {
      this.removeCoupon();
    }
  }
  getDiscountPrice(value: number) {
    return Math.round((value * (this.designDetail?.percentage ? this.designDetail?.percentage : 70)) / 100);
  }
  openDrawer() {
    this.commonService.showFabIcons.next(false);
    this.emitDrawer.emit({ 
      items: this.selectedItems, 
      total: this.totalPrice - this.getDiscountPrice(this.totalPrice), 
      isOffer: this.designDetail?.isOffer && this.isOfferApplied && (this.totalPrice - this.getDiscountPrice(this.totalPrice)) >= this.designDetail?.offerCondition, 
      coupon: this.couponCode,
      referralCode: this.referralCode,
      referralStatus: this.referralStatus
    });
  }
  onOpenPreviewImage(item: any) {
    this.selectedCracker = item
    const dialogRef = this.dialog.open(this.dialogTemplate, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed');
    });
  }
  incQuantity(cracker: any) {
    cracker.quantity = Number(cracker.quantity) + 1;
    this.updateTotals()
  }
  decQuantity(cracker: any) {
    cracker.quantity = Number(cracker.quantity) - 1;
    this.updateTotals()
  }

  onPlaceOrder(event: any) {
    this.orderInfo = null;
    const finalTotal = this.getFinalTotal();
    if (finalTotal >= (this.designDetail?.minimumPurchase ?? 4000)) {
      const data = event;
      data.store_id = environment.supabase.store_id;
      data.createdAt = new Date();
      data.couponAmount = this.applyCouponValue ?? 0;
      data.couponCode = this.couponCode?.code ?? '';
      data.items = this.selectedItems;
      data.totalAmount = finalTotal;
      data.profit = this.totalProfit - (this.applyCouponValue ?? 0);
      data.referralCode = this.referralStatus === 'valid' ? this.referralCode : '';
      
      this.dialog.closeAll()
      this.orderInfo = data;
      this.dialog.open(this.successTemplate, {
        width: '400px',
      });
      
      this.apiService.addSupaData('orders', data).then((res) => {
        if (this.designDetail && this.designDetail.billDownload) {
          this.getBill('download');
        }
        if (this.couponCode && this.couponCode.code) {
          this.couponCode['count'] = this.couponCode?.count ? (this.couponCode.count + 1) : 1;
          this.apiService.updateSupaData('coupon', { column: 'id', value: this.couponCode?.id }, { count: this.couponCode?.count })
        }
        if (this.referralStatus === 'valid' && this.referralCode) {
          this.apiService.addReferral(this.referralCode);
        }
        this.status = 'success'
        this.applyCouponValue = 0;
        this.isOfferApplied = false;
        this.selectedItems = []
        this.totalPrice = 0;
        this.totalProfit = 0;
        this.resetAll();
        this.apiService.sendEmail(event).then(() => {
          // console.log();
        })
      }).catch((err) => {
        this.status = 'failed'
        alert("Oops error occured!")
      })
    }
    else {
      alert(`Minimum order above ₹ ${this.designDetail?.minimumPurchase ?? 4000} /-`)
    }
  }
  
  getFinalTotal(): number {
    let price = this.totalPrice - this.getDiscountPrice(this.totalPrice);
    if (this.isOfferApplied && this.designDetail?.isOffer && price >= this.designDetail?.offerCondition) {
      price -= (this.designDetail?.offerAmount ?? 0);
    }
    price -= (this.applyCouponValue ?? 0);
    return price;
  }

  checkCoupon(searchString: string) {
    if (searchString) {
      this.apiService.checkCoupon(searchString).then((res) => {
        if (res) {
          this.couponArray = res;
          this.applyCouponValue = this.couponArray.amount;
          this.couponCode = this.couponArray;
          this.triggerConfetti()
          this._snack.open(`Coupon for ₹${this.couponArray.amount} applied`, 'ok', { duration: 3000 })
        }
        else {
          this._snack.open("Coupon expired or invalid", 'ok', { duration: 3000 })
        }
      })
    }
  }
  
  checkReferralCode(code: string) {
    if (!code) return;
    this.referralStatus = 'pending';
    this.apiService.checkReferral(code).then(isValid => {
      if (isValid) {
        this.referralStatus = 'valid';
        this.referralCode = code;
        this.referralError = '';
        this._snack.open('Referral code applied successfully!', 'ok', { duration: 3000 });
      } else {
        this.referralStatus = 'invalid';
        this.referralError = 'Invalid referral code';
        this._snack.open('Invalid referral code', 'ok', { duration: 3000 });
      }
    });
  }

  removeReferralCode() {
    this.referralCode = '';
    this.referralStatus = '';
    this.referralError = '';
  }

  removeCoupon() {
    this.couponCode = null;
    this.applyCouponValue = 0;
  }
  resetAll() {
    this.couponCode = {};
    this.applyCouponValue = 0;
    this.selectedItems = [];
    this.totalPrice = 0;
    this.totalProfit = 0;
    this.isOfferApplied = false;
    this.coupon = '';
    this.referralCode = '';
    this.referralStatus = '';
    for (const table of this.allCrackers) {
      for (const cracker of table.crackers) {
        if (cracker) {
          cracker.quantity = 0;
          cracker.qtAmount = 0;
          cracker.offerPrice = 0;
        }
      }
    }
  }
  triggerConfetti() {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }

  // Function to scroll to the "contact-container" section
  goToBottom(): void {
    const contactElement = document.querySelector('.contact-container');
    if (contactElement) {
      contactElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // HostListener to detect scroll events
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.checkScrollPosition();
  }

  // Function to check scroll position and hide/show the button
  checkScrollPosition(): void {
    const contactElement = document.querySelector('.contact-container');
    if (contactElement) {
      const contactOffset = contactElement.getBoundingClientRect().top;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;

      // If the user scrolls to the bottom and the contact section is in view, hide the button
      if (contactOffset <= windowHeight && scrollTop > 0) {
        this.showScrollBtn = false;
      } else if (scrollTop === 0) {
        // When the user scrolls back to the top, show the button
        this.showScrollBtn = true;
      } else {
        // If the user scrolls up and the contact section is not visible, show the button again
        this.showScrollBtn = true;
      }
    }
  }

  getBill(type: 'open' | 'download' | 'print') {
    let billData = this.getBillData();
    let brandName = this.designDetail?.brandText || 'Shri Meenakshi Crackers';
    if (type == 'open')
      this.commonService.generatePdf(billData).open();
    else if (type == 'download')
      this.commonService.generatePdf(billData).download(`${brandName.replace(/\s+/g, '-')}-Bill`);
    else if (type == 'print')
      this.commonService.generatePdf(billData).print();
  }

  getBillData() {
    let data: any = {};
    data.date = this.orderInfo.createdAt;
    data.customerInfo = { 
      name: this.orderInfo.name,
      phone: this.orderInfo.phone,
      address: `${this.orderInfo.address}, ${this.orderInfo.district}`
    };
    let billCart: any[] = [];
    let totalQty = 0;
    this.orderInfo.items.forEach((item: any, index: any) => {
      const obj = { itemName: '', mrp: 0, rate: 0, qty: 0, amount: 0 };
      obj.itemName = item.name;
      obj.mrp = item.price;
      obj.rate = item.offerPrice;
      obj.qty = item.quantity;
      obj.amount = item.qtAmount;
      billCart[index] = obj;
      totalQty += item.quantity;
    })
    data.cart = billCart;
    data.subTotal = this.orderInfo.items.reduce((acc: number, item: any) => acc + (item.offerPrice * item.quantity), 0);
    data.total = this.orderInfo.totalAmount;
    data.totalCases = totalQty;
    data.taxableValue = data.total / 1.18;
    data.gstAmount = data.total - data.taxableValue;
    return data;
  }
  searchCrackers(){
    if(this.searchText.value){
      this.filteredCrackers = this.filterAndSortCrackers(this.searchText.value)
    }
  }

  filterAndSortCrackers(keyword: string): any[] {
    // Flatten crackers array from each category and retain reference to original
    const crackers = this.allCrackers.flatMap((category) =>
      category.crackers.map((cracker:any) => ({
        ...cracker,
        originalReference: cracker // Store reference to original cracker object
      }))
    );
  
    // Filter and sort based on keyword
    const filteredAndSortedCrackers = crackers
      .filter((cracker) =>
        cracker.name.toLowerCase().includes(keyword.toLowerCase())
      )
      .sort((a, b) => {
        const aStartsWith = a.name.toLowerCase().startsWith(keyword.toLowerCase());
        const bStartsWith = b.name.toLowerCase().startsWith(keyword.toLowerCase());
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return 0;
      })
      .map((cracker) => cracker.originalReference); // Map back to original references
  
    // Return filtered results in original structure format
    return filteredAndSortedCrackers.length
      ? [{ heading: `search result for '${this.searchText.value}'`, crackers: filteredAndSortedCrackers }]
      : [];
  }
  getCorrectCrackers(){
    if(this.searchText.value){
      return this.filteredCrackers
    }
    else{
      return this.allCrackers
    }
  }
}
