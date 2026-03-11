import { Component, inject, DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';

interface ICountdown {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}

@Component({
  selector: 'app-hero-banner',
  standalone: true,
  imports: [],
  templateUrl: './hero-banner.html',
  styleUrl: './hero-banner.scss',
})
export class HeroBannerComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly saleEndDate = this.loadOrCreateSaleEnd();

  private loadOrCreateSaleEnd(): Date {
    const stored = localStorage.getItem('sale_end_date');
    if (stored) return new Date(stored);

    const end = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);
    localStorage.setItem('sale_end_date', end.toISOString());
    return end;
  }
  readonly countdown = signal<ICountdown>(this.computeICountdown());

  constructor() {
    interval(1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.countdown.set(this.computeICountdown()));
  }

  private computeICountdown(): ICountdown {
    const distance = this.saleEndDate.getTime() - Date.now();

    if (distance <= 0) {
      localStorage.removeItem('sale_end_date');
      return { days: '00', hours: '00', minutes: '00', seconds: '00' };
    }

    return {
      days: String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, '0'),
      hours: String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(
        2,
        '0',
      ),
      minutes: String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0'),
      seconds: String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0'),
    };
  }
}
