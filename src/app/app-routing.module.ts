import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './core/pages/home/home.component';
import { TrackingComponent } from './core/pages/tracking/tracking.component';

const routes: Routes = [
  {path:'',component:HomeComponent},
  {path:'tracking',component:TrackingComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
