import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss'
})
export class CategoryComponent {
  categoryData:any;
  isDown!: boolean;
  scrollLeft:any;
  startX!: number;
 @ViewChild('carousel', { static: false }) infiniteBanner!: ElementRef;
ngOnInit(): void {
 this.categoryData=[
   {imaage:'',color:'#4d3316',text:'Shirts'},
   {imaage:'',color:'#156d70',text:'pants'},
   {imaage:'',color:'#631c1d',text:'T-Shirts'},
   {imaage:'',color:'#194d16',text:'Shoes'}
 ]
 this.isDown = false;
 this.startX = 0;
 this.scrollLeft = 0;
}
@HostListener('mousedown', ['$event'])
@HostListener('touchstart', ['$event'])
start(event: any): void { 
 if (this.infiniteBanner) {
   this.isDown = true;
   this.infiniteBanner?.nativeElement?.classList.add('active');
   const e = (event.touches && event.touches[0]) || event;
   this.startX = e.pageX - this.infiniteBanner?.nativeElement?.offsetLeft;
   this.scrollLeft = this.infiniteBanner?.nativeElement?.scrollLeft;
 }
}
/**
 * function used for listen mouse drag  move
 * @param event
 */
@HostListener('mousemove', ['$event'])
@HostListener('touchmove', ['$event'])
move(event: any): void {
 if (this.infiniteBanner) {
   const bannerElement = this.infiniteBanner?.nativeElement;
   if (!this.isDown) return;
   // event.preventDefault();
   let e = (event.touches && event.touches[0]) || event;
   let x = e.pageX - bannerElement.offsetLeft;
   let dist = (x - this.startX);
   bannerElement.scrollLeft = this.scrollLeft - dist;
 }
}

/**
 * function used for listen mouse drag  end
 */
@HostListener('mouseleave')
@HostListener('mouseup')
@HostListener('touchend')
end(): void {
 if (this.infiniteBanner) {
   this.isDown = false;
   this.infiniteBanner?.nativeElement.classList.remove('active');
 }
}
}
