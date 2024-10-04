import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { CURSOR_RADIUS, MAIN_COLORS, MAIN_TITLE } from '../../constants/main-page-data.constant';
import { Particle } from '../../classes/Particle';
import { ICoordinates } from '../../interfaces/particle.interface';

@Component({
  selector: 'app-header-banner',
  templateUrl: './header-banner.component.html',
  styleUrls: ['./header-banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderBannerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('scene') private canvas!: ElementRef<HTMLCanvasElement>;

  private particlesAmount = 0;
  private mouse!: ICoordinates;
  private radius!: number;
  private particles!: Particle[];
  private context!: CanvasRenderingContext2D;
  private requestId!: number;

  constructor(
    private host: ElementRef<HTMLElement>,
    private router: Router,
  ) { }

  public ngAfterViewInit(): void {
    this.mouse = {
      x: 0,
      y: 0,
    };
    this.context = this.canvas.nativeElement.getContext('2d')!;

    this.radius = CURSOR_RADIUS;

    this.initScene();
    requestAnimationFrame(() => {
      this.render();
    });
  }

  private clearScene(): void {
    this.context.clearRect(
      0,
      0,
      this.canvas.nativeElement.width,
      this.canvas.nativeElement.height
    );
  }

  private paintParticles(viewWidth: number, viewHeight: number): void {
    const data = this.context.getImageData(0, 0, viewWidth, viewHeight).data;

    this.clearScene();

    this.context.globalCompositeOperation = 'screen';

    const quantity = this.host.nativeElement.scrollWidth < 768 ? 120 : 200;

    this.particles = [];
    for (let x = 0; x < viewWidth; x += Math.round(viewWidth / quantity)) {
      for (let y = 0; y < viewHeight; y += Math.round(viewWidth / quantity)) {
        if (data[(x + y * viewWidth) * 4 + 3] > 120) {
          this.particles.push(new Particle(x, y, MAIN_COLORS, this.context));
        }
      }
    }
    this.particlesAmount = this.particles.length;
  }

  public navigateToContactPage(): void {
    this.router.navigate(['/contacts']);
  }

  @HostListener('window:resize', ['$event'])
  private initScene(): void {
    this.clearScene()

    const viewWidth = (this.canvas.nativeElement.width =
      this.host.nativeElement.clientWidth);
    const viewHeight = (this.canvas.nativeElement.height =
      this.host.nativeElement.clientHeight);

    this.context.font = `bold ${viewWidth / 6}px sans-serif`;
    this.context.textAlign = 'center';
    this.context.fillText(MAIN_TITLE, viewWidth / 2, viewHeight * 0.6);
    this.paintParticles(viewWidth, viewHeight);
  }

  private render(): void {
    this.requestId = requestAnimationFrame(this.render.bind(this));
    this.clearScene();
    this.particles.forEach((particle) => {
      particle.render(this.mouse, this.radius);
    });
  }

  public ngOnDestroy(): void {
    cancelAnimationFrame(this.requestId);
  }

  @HostListener('mousemove', ['$event'])
  private onMouseMove(e: MouseEvent): void {
    this.mouse.x = e.offsetX;
    this.mouse.y = e.offsetY;
  }

  @HostListener('touchmove', ['$event'])
  private onTouchMove(e: TouchEvent): void {
    if (e.touches.length > 0) {
      this.mouse.x = e.touches[0].clientX;
      this.mouse.y = e.touches[0].clientY;
    }
  }

  @HostListener('mouseout', ['$event'])
  private onMouseEnd(): void {
    this.mouse.x = -9999;
    this.mouse.y = -9999;
  }

  @HostListener('click', ['$event'])
  private onMouseClick(): void {
    this.radius++;
    if (this.radius === 10) {
      this.radius = CURSOR_RADIUS;
    }
  }

  @HostListener('touchstart', ['$event'])
  private onTouchEnd(): void {
    const timer =  setInterval(()=>{
      this.mouse.x = -9999;
      this.mouse.y = -9999;
      clearInterval(timer)
    }, 1000)
  }
}
