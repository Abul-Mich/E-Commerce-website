import { Component, inject, signal, DestroyRef, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, filter } from 'rxjs';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.scss',
})
export class SearchBarComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  searchValue = '';
  readonly mobileOpen = signal(false);
  readonly isFocused = signal(false);

  private readonly searchSubject = new Subject<string>();

  ngOnInit(): void {
    const initial = this.route.snapshot.queryParamMap.get('search') ?? '';
    this.searchValue = initial;

    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        const q = this.route.snapshot.queryParamMap.get('search') ?? '';
        if (q !== this.searchValue) this.searchValue = q;
      });
  }

  constructor() {
    this.searchSubject
      .pipe(debounceTime(350), takeUntilDestroyed(this.destroyRef))
      .subscribe((query) => this.navigateWithQuery(query));
  }

  onInput(value: string): void {
    this.searchSubject.next(value);
  }

  onSearch(): void {
    this.navigateWithQuery(this.searchValue);
    this.mobileOpen.set(false);
  }

  clear(): void {
    this.searchValue = '';
    this.navigateWithQuery('');
    this.mobileOpen.set(false);
  }

  toggleMobile(): void {
    this.mobileOpen.update((v) => !v);
    if (this.mobileOpen()) {
      setTimeout(() => {
        document.querySelector<HTMLInputElement>('.search-bar--mobile input')?.focus();
      }, 60);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.mobileOpen.set(false);
    this.isFocused.set(false);
  }

  private navigateWithQuery(query: string): void {
    const trimmed = query.trim();
    this.router
      .navigate(['/products'], {
        queryParams: trimmed ? { search: trimmed } : {},
        queryParamsHandling: trimmed ? 'merge' : '',
      })
      .then(() => {
        document
          .getElementById('products-section')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
  }
}
