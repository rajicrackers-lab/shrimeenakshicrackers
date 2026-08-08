import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DatePipe } from '@angular/common';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(private datePipe: DatePipe) {
   }
  showFabIcons = new BehaviorSubject<boolean>(true);
  designDetail = new BehaviorSubject<any>({});

  sendWhatsApp(orderInfo: any) {
    let brandName = this.designDetail.value.brandText || 'Shri Meenakshi Crackers';
    let message = `Hi, this is ${orderInfo.name} from ${orderInfo.district}, I recently placed an order for crackers worth ₹${orderInfo.totalAmount} with ${brandName}.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${this.designDetail.value.whatsapp}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  }

  formateCart(cart: any, language: string) {
    let cartArray: any = [];
    for (let i = 0; i < cart.length; i++) {
      cartArray[i] = [language === 'tamil' ? (cart[i].tamilName ? cart[i].tamilName : cart[i].itemName) : cart[i].itemName, cart[i].mrp ?? 0, cart[i].rate ?? 0, cart[i].qty ?? 0, cart[i].amount ?? 0];
    }
    return cartArray
  }

  formatDate(dateString: string, showTime: boolean): string {
    const date = new Date(dateString);
    const formattedDate = this.datePipe.transform(date, showTime ? 'dd/MM/yy, h:mm a' : 'dd/MM/yy');
    return formattedDate || '';
  }

  layoutSettings = {
    billLanguage: "english",
    showTime: true
  }

  basicSettings: any = {
    address: '',
    storename: '',
    phone: '',
    gstNo: '',
  }

  numberToWords(num: number): string {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if ((num = num.toString().indexOf('.') !== -1 ? Number(num.toString().split('.')[0]) : num) === 0) return 'Zero';

    const n = ('0000000' + num).slice(-7).match(/^(\d{2})(\d{2})(\d{2})(\d{1})$/);
    if (!n) return '';

    let str = '';
    str += Number(n[1]) !== 0 ? (a[Number(n[1])] || b[Number(n[1][0])] + ' ' + a[Number(n[1][1])]) + 'Lakh ' : '';
    str += Number(n[2]) !== 0 ? (a[Number(n[2])] || b[Number(n[2][0])] + ' ' + a[Number(n[2][1])]) + 'Thousand ' : '';
    str += Number(n[3]) !== 0 ? (a[Number(n[3])] || b[Number(n[3][0])] + ' ' + a[Number(n[3][1])]) + 'Hundred ' : '';
    str += Number(n[4]) !== 0 ? (str !== '' ? 'and ' : '') + (a[Number(n[4])] || b[Number(n[4][0])] + ' ' + a[Number(n[4][1])]) : '';

    return 'Rupees ' + str + 'Only';
  }

  generatePdf(printingBill: any) {
    let layoutSetting = this.layoutSettings;
    this.designDetail.subscribe((res) => {
      this.basicSettings.address = res.address;
      this.basicSettings.storename = res.brandText;
      this.basicSettings.phone = res.whatsapp;
      this.basicSettings.gstNo = res.gstNo || '';
    });

    let basicSetting = this.basicSettings;
    let data = {
      billLanguage: layoutSetting.billLanguage,
      shopName: basicSetting.storename || 'Shri Meenakshi Crackers',
      shopAddress: basicSetting.address || '',
      shopMobile: basicSetting.phone || '',
      shopGst: basicSetting.gstNo || '',
      billNo: printingBill.billNo || '',
      billDate: this.formatDate(printingBill.date, false),
      customerName: printingBill.customerInfo?.name || '',
      customerPhone: printingBill.customerInfo?.phone || '',
      customerAddress: printingBill.customerInfo?.address || '',
      cart: printingBill.cart || [],
      subTotal: printingBill.subTotal || 0,
      total: printingBill.total || 0,
      totalCases: printingBill.totalCases || 0,
      taxableValue: printingBill.taxableValue || 0,
      gstAmount: printingBill.gstAmount || 0,
      amountInWords: this.numberToWords(printingBill.total || 0)
    };

    const tableBody: any[] = [
      [
        { text: 'S. No', style: 'tableHeader', alignment: 'center' },
        { text: 'Description', style: 'tableHeader', alignment: 'center' },
        { text: 'No of Cases/Box', style: 'tableHeader', alignment: 'center' },
        { text: 'Rate', style: 'tableHeader', alignment: 'center' },
        { text: 'Amount', style: 'tableHeader', alignment: 'center' },
      ],
    ];

    data.cart.forEach((item: any, i: number) => {
      tableBody.push([
        { text: i + 1, alignment: 'center' },
        { text: item.itemName, alignment: 'left' },
        { text: item.qty, alignment: 'center' },
        { text: (item.rate).toFixed(2), alignment: 'right' },
        { text: (item.amount).toFixed(2), alignment: 'right' },
      ]);
    });

    const minRows = 12;
    for (let i = data.cart.length; i < minRows; i++) {
      tableBody.push([
        { text: ' ', margin: [0, 10, 0, 10] },
        '', '', '', ''
      ]);
    }

    const dd: any = {
      pageSize: 'A4',
      pageMargins: [20, 20, 20, 20],
      content: [
        {
          columns: [
            { text: `GSTIN :${data.shopGst}`, style: 'headerSmall', width: '30%' },
            {
              stack: [
                { text: 'TAX INVOICE', style: 'taxInvoiceLabel' },
                { text: data.shopName, style: 'companyName' },
                { text: 'Fancy Fireworks Dealer', style: 'companySubtitle' },
                { text: data.shopAddress, style: 'headerAddress' },
              ],
              width: '40%', alignment: 'center'
            },
            {
              stack: [
                { text: 'Original', alignment: 'right', fontSize: 8 },
                { text: `Cell : ${data.shopMobile}`, alignment: 'right', fontSize: 10, bold: true, margin: [0, 5, 0, 0] },
              ],
              width: '30%'
            }
          ],
          margin: [0, 0, 0, 5]
        },
        {
          table: {
            widths: ['40%', '35%', '25%'],
            body: [
              [
                {
                  stack: [
                    { text: 'To', bold: true, fontSize: 9 },
                    { text: `M/s. ${data.customerName}`, bold: true, fontSize: 8, margin: [15, 2, 0, 0] },
                    { text: data.customerAddress, fontSize: 8, margin: [15, 2, 0, 0] },
                  ],
                  border: [true, true, true, true]
                },
                {
                  stack: [
                    { text: 'Delivery To Details', bold: true, fontSize: 9 },
                    { text: data.customerName, fontSize: 8, margin: [0, 2, 0, 0] },
                  ],
                  border: [false, true, true, true]
                },
                {
                  stack: [
                    { text: `Invoice No : ${data.billNo}`, bold: true, fontSize: 8 },
                    { text: `Invoice Date : ${data.billDate}`, bold: true, fontSize: 8, margin: [0, 5, 0, 0] },
                  ],
                  border: [false, true, true, true]
                }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
          }
        },
        {
          table: {
            headerRows: 1,
            widths: ['8%', '50%', '14%', '14%', '14%'],
            body: tableBody
          },
          layout: {
            hLineWidth: (i: number, node: any) => (i === 0 || i === 1 || i === node.table.body.length) ? 1 : 0,
            vLineWidth: () => 1,
          },
          margin: [0, 0, 0, 0]
        },
        {
          table: {
            widths: ['35%', '30%', '35%'],
            body: [
              [
                {
                  stack: [
                    {
                      columns: [
                        { text: 'Dispatch From', fontSize: 8, bold: true, width: '40%' },
                        { text: 'SIVAKASI', fontSize: 8, width: '60%' }
                      ]
                    },
                    {
                      columns: [
                        { text: 'Dispatch To', fontSize: 8, bold: true, width: '40%' },
                        { text: data.customerAddress.split(',')[0] || '', fontSize: 8, width: '60%' }
                      ], margin: [0, 2, 0, 0]
                    },
                    { text: 'Transport', fontSize: 8, bold: true, margin: [0, 2, 0, 0] },
                    { text: 'HSN/SAC   3604 1000(FIRE WORKS)', fontSize: 8, margin: [0, 2, 0, 0] },
                    { text: 'Subject to Virudhunagar Jurisdicition', fontSize: 8, bold: true, margin: [0, 2, 0, 0] },
                    { canvas: [{ type: 'line', x1: 0, y1: 2, x2: 180, y2: 2, lineWidth: 0.5 }], margin: [0, 2, 0, 2] },
                    { text: 'Bank Details', fontSize: 8, bold: true, decoration: 'underline' },
                    {
                      columns: [
                        { text: 'Bank Name:', fontSize: 8, bold: true, width: '35%' },
                        { text: 'SBI', fontSize: 8, width: '65%' }
                      ]
                    },
                    {
                      columns: [
                        { text: 'A/c No:', fontSize: 8, bold: true, width: '35%' },
                        { text: '43372228564', fontSize: 8, width: '65%' }
                      ]
                    },
                    {
                      columns: [
                        { text: 'IFSC Code:', fontSize: 8, bold: true, width: '35%' },
                        { text: 'SBIN0000921', fontSize: 8, width: '65%' }
                      ]
                    },
                    {
                      columns: [
                        { text: 'Branch:', fontSize: 8, bold: true, width: '35%' },
                        { text: 'SIVAKASI', fontSize: 8, width: '65%' }
                      ]
                    },
                  ],
                  border: [true, true, true, true]
                },
                {
                  stack: [
                    { text: `Total Cases/Boxs: ${data.totalCases}`, fontSize: 9, bold: true },
                  ],
                  border: [false, true, true, true]
                },
                {
                  table: {
                    widths: ['60%', '40%'],
                    body: [
                      [{ text: 'Sub Total', fontSize: 9, bold: true }, { text: data.subTotal.toFixed(2), fontSize: 9, alignment: 'right' }],
                      [{ text: ' ', margin: [0, 25, 0, 0] }, ' '],
                      [{ text: 'Taxable Value', fontSize: 8 }, { text: data.taxableValue.toFixed(2), fontSize: 8, alignment: 'right' }],
                      [{ text: 'IGST     @18.0%', fontSize: 8 }, { text: data.gstAmount.toFixed(2), fontSize: 8, alignment: 'right' }],
                      [{ text: ' ', fontSize: 8 }, { text: '0.00', fontSize: 8, alignment: 'right' }],
                      [{ text: 'Round Off', fontSize: 8 }, { text: '0.00', fontSize: 8, alignment: 'right' }],
                      [{ text: 'Net Amount', fontSize: 9, bold: true }, { text: data.total.toFixed(2), fontSize: 9, bold: true, alignment: 'right' }],
                    ]
                  },
                  layout: 'noBorders',
                  border: [false, true, true, true]
                }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
          }
        },
        {
          table: {
            widths: ['*'],
            body: [[{ text: `Total Amount In Words: ${data.amountInWords}`, fontSize: 8, bold: true }]]
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
          }
        },
        {
          columns: [
            { text: 'Prepared By', alignment: 'center', fontSize: 9, bold: true, margin: [0, 30, 0, 0] },
            { text: 'Checked By', alignment: 'center', fontSize: 9, bold: true, margin: [0, 30, 0, 0] },
            {
              stack: [
                { text: `For ${data.shopName}`, alignment: 'right', fontSize: 9, bold: true },
                { text: 'Authorized Signatory', alignment: 'right', fontSize: 9, bold: true, margin: [0, 30, 0, 0] }
              ]
            }
          ],
          margin: [20, 10, 20, 0]
        }
      ],
      styles: {
        headerSmall: { fontSize: 9, bold: true },
        taxInvoiceLabel: {
          fontSize: 8, bold: true, background: 'black', color: 'white', alignment: 'center'
        },
        companyName: { fontSize: 22, bold: true, alignment: 'center' },
        companySubtitle: { fontSize: 10, italic: true, bold: true, alignment: 'center' },
        headerAddress: { fontSize: 8, alignment: 'center' },
        tableHeader: { bold: true, fontSize: 9, fillColor: '#eeeeee' },
        normal: { fontSize: 8 },
      },
    };
    return pdfMake.createPdf(dd);
  }

}
