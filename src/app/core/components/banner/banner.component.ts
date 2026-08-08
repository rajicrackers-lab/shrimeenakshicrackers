import { Component, Input } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss'],
  animations: [
    trigger('fadeIn', [
      state('void', style({ opacity: 0 })),
      transition(':enter', [
        animate('800ms ease-in', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class BannerComponent {
  brandState = 'normal';
  @Input('designDetail') designDetail: any;

  ngOnInit() {
    this.animateBrand();
  }

  animateBrand() {
    setInterval(() => {
      this.brandState = this.brandState === 'normal' ? 'bounce' : 'normal';
    }, 2000);
  }

  getBackgroundStyle(): { [key: string]: string } {
    const bg = this.designDetail?.banner_design?.background;
    const value = bg?.type === 'color' ? bg.color : bg?.gradient || 'linear-gradient(to right, #ff6f61, #ffcc5c)';
    return { background: value };
  }

  getTitleStyles(): { [key: string]: string } {
    const title = this.designDetail?.banner_design?.title;
    if (!title) return {};
    return {
      'font-size': `${title.fontSize || 2}rem`,
      'font-weight': title.fontWeight || 'normal',
      'font-family': title.fontFamily || 'Georgia, serif',
      'color': title.color || '#FFD700',
      'text-transform': title.textTransform || 'none',
      'text-shadow': title.textShadow || 'none',
      'margin-block': `${title.marginBlock || 10}px`,
      'text-align': title.textAlign || 'left',
      'line-height': `${title.lineHeight || 1.1}`
    };
  }

  getSubtitleStyles(): { [key: string]: string } {
    const subtitle = this.designDetail?.banner_design?.subtitle;
    if (!subtitle) return {};
    return {
      'font-size': `${subtitle.fontSize || 3.5}rem`,
      'font-weight': subtitle.fontWeight || '900',
      'font-family': subtitle.fontFamily || '"Permanent Marker", cursive',
      'color': subtitle.color || '#ffffff',
      'text-transform': subtitle.textTransform || 'uppercase',
      'text-shadow': subtitle.textShadow || '2px 2px 4px rgba(0,0,0,0.6), -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
      'margin-block': `${subtitle.marginBlock || 20}px`,
      'text-align': subtitle.textAlign || 'left',
      'line-height': `${subtitle.lineHeight || 1.1}`
    };
  }

  getButtonStyles(): { [key: string]: string } {
    const button = this.designDetail?.banner_design?.button;
    if (!button) return {};
    return {
      'font-size': `${button.fontSize || 1.2}rem`,
      'font-weight': button.fontWeight || 'bold',
      'font-family': button.fontFamily || 'Arial, sans-serif',
      'color': button.color || '#000000',
      'background-color': button.backgroundColor || '#FFC107',
      'padding': `${button.padding || 10}px`,
      'border-radius': `${button.borderRadius || 25}px`
    };
  }

  getImageStyles(): { [key: string]: string } {
    const image = this.designDetail?.banner_design?.image;
    if (!image) return {};
    return {
      'width': `${image.width || 200}px`,
      'float': image.position || 'right'
    };
  }
}