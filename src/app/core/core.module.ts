import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { BannerComponent } from './components/banner/banner.component';
import { HomeComponent } from './pages/home/home.component';
import { DiscountComponent } from './components/discount/discount.component';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ProductsComponent } from './components/products/products.component';
import { FooterComponent } from './components/footer/footer.component';
import { CategoryComponent } from './components/category/category.component';
import { QuotesComponent } from './components/quotes/quotes.component';
import { DisclaimerComponent } from './components/disclaimer/disclaimer.component';
import { FormComponent } from './components/form/form.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MiddleComponent } from './components/middle/middle.component';
import {MatSidenavModule} from '@angular/material/sidenav';
import { YoutubeComponent } from './components/youtube/youtube.component';
import { CarouselComponent } from './components/carousel/carousel.component';
import { TrackingComponent } from './pages/tracking/tracking.component';
import { RouterModule } from '@angular/router';

const materials=[
  MatIconModule,
  MatButtonModule,
  FlexLayoutModule,
  MatButtonModule,
  MatIconModule,
  MatDialogModule,
  MatInputModule,
  MatFormFieldModule,
  ReactiveFormsModule,
  FormsModule,
  MatSnackBarModule,
  BrowserModule,
  MatDividerModule,
  BrowserAnimationsModule,
  MatSelectModule,
  MatSidenavModule,
  RouterModule
]

@NgModule({
  declarations: [
    BannerComponent,
    HomeComponent,
    DiscountComponent,
    ProductsComponent,
    FooterComponent,
    CategoryComponent,
    QuotesComponent,
    DisclaimerComponent,
    FormComponent,
    MiddleComponent,
    YoutubeComponent,
    CarouselComponent,
    TrackingComponent
  ],
  imports: [
    CommonModule,
    materials
  ],
  exports:[
    materials
  ],
  providers:[DatePipe]
})
export class CoreModule { }
