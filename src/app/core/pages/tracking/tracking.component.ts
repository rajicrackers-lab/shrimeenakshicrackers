import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';

interface Order {
  id: string;
  date: Date;
  status: string;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  shippingAddress: string;
  trackingNumber?: string;
}
@Component({
  selector: 'app-tracking',
  templateUrl: './tracking.component.html',
  styleUrl: './tracking.component.scss'
})
export class TrackingComponent {
  phoneForm: FormGroup;
  orders: Order[] = [];
  loading = false;
  error = '';
  expandedOrderId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService
  ) {
    this.phoneForm = this.fb.group({
      phoneNumber: ['', [
        Validators.required, 
        Validators.pattern('^[0-9]{10}$')
      ]]
    });
  }

  ngOnInit(): void {
  }

  async onSubmit() {
    if (this.phoneForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';
    const phoneNumber = this.phoneForm.get('phoneNumber')?.value;

    try {
      const { data, error } = await this.apiService.getDataByField('orders', 'phone', phoneNumber);
    
      if (error) {
        throw error;
      }
    if(data)
      this.orders = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (err) {
      this.error = 'Failed to retrieve orders. Please try again.';
      console.error('Error fetching orders:', err);
    } finally {
      this.loading = false;
    }
  }

  toggleOrderDetails(orderId: string): void {
    if (this.expandedOrderId === orderId) {
      this.expandedOrderId = null;
    } else {
      this.expandedOrderId = orderId;
    }
  }

  isOrderExpanded(orderId: string): boolean {
    return this.expandedOrderId === orderId;
  }

  getTotalItems(order: Order): number {
    return order.items.reduce((sum, item) => sum + Number(item.quantity), 0);
  }  
  getStatusColor(orderStatus: string): string {
    switch (orderStatus) {
      case 'unpaid':
        return '#ffae00';
      case 'inprogress':
        return '#e45fff';
      case 'packed':
        return '#1e90ff';
      case 'deleted':
        return '#ff0000';
      case 'completed':
        return '#27d227';
      default:
        return 'pink';
    }
  }
}
