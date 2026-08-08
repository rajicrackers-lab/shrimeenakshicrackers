import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-youtube',
  templateUrl: './youtube.component.html',
  styleUrl: './youtube.component.scss'
})
export class YoutubeComponent {
  @Input('designDetail') designDetail:any;
  url!: SafeResourceUrl;
  constructor (private sanitizer:DomSanitizer) {}
  ngOnInit(): void {
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl(
      // https://www.youtube.com/embed/Kr6f5OdQSbo?si=ZLzJyi-Uncz_7NvL
      `${this.designDetail.videoSection}?enablejsapi=1&autoplay=1`
    );
  }
}
