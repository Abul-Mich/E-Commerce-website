import { ProductService } from '../../core/services/product';
import { Component, inject, computed, signal } from '@angular/core';
import { AllCommunityModule, ModuleRegistry, themeQuartz } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, GridReadyEvent, GridApi } from 'ag-grid-community';
import { toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { IProduct } from '../../shared/models/product';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-dashboard',
  imports: [AgGridAngular, DecimalPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent {
  private readonly productService = inject(ProductService);

  readonly products = toSignal(this.productService.getProducts(), { initialValue: [] });

  private gridApi: GridApi | null = null;
  readonly theme = themeQuartz;
  readonly searchQuery = signal('');
  readonly activeCategory = signal('All');

  readonly stats = computed(() => {
    const p = this.products();
    if (!p.length) return { total: 0, avgPrice: 0, topRated: 0, categories: 0 };
    return {
      total: p.length,
      avgPrice: p.reduce((s, x) => s + x.price, 0) / p.length,
      topRated: p.filter((x) => x.rating.rate >= 4).length,
      categories: new Set(p.map((x) => x.category)).size,
    };
  });

  readonly categories = computed(() => {
    const cats = [...new Set(this.products().map((p) => p.category))].sort();
    return ['All', ...cats];
  });

  readonly rowData = computed(() => {
    const cat = this.activeCategory();
    const q = this.searchQuery().toLowerCase().trim();
    return this.products()
      .filter((x) => cat === 'All' || x.category === cat)
      .filter(
        (x) => !q || x.title.toLowerCase().includes(q) || x.category.toLowerCase().includes(q),
      );
  });

  readonly colDefs: ColDef[] = [
    {
      field: 'id',
      headerName: '#',
      width: 70,
      sortable: true,
      cellStyle: { color: '#9aa3bb', fontWeight: '600', fontSize: '0.8rem' },
    },
    {
      field: 'image',
      headerName: '',
      width: 64,
      sortable: false,
      filter: false,
      cellRenderer: (params: { value: string }) =>
        `<div style="display:flex;align-items:center;justify-content:center;height:100%;">
          <img src="${params.value}" style="width:36px;height:36px;object-fit:contain;border-radius:6px;background:#f4f6fb;padding:4px;" onerror="this.src='icons/placeholder.svg'" />
        </div>`,
    },
    {
      field: 'title',
      headerName: 'Product',
      flex: 2,
      minWidth: 200,
      sortable: true,
      filter: true,
      cellRenderer: (params: { value: string }) =>
        `<div style="white-space:normal;line-height:1.35;padding:4px 0;font-weight:500;color:#1a1f2e;font-size:0.83rem;">${params.value}</div>`,
      autoHeight: true,
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 160,
      sortable: true,
      filter: true,
      cellRenderer: (params: { value: string }) => {
        const colors: Record<string, string> = {
          electronics: '#dbeafe:#1d4ed8',
          jewelery: '#fef3c7:#92400e',
          "men's clothing": '#dcfce7:#166534',
          "women's clothing": '#fce7f3:#9d174d',
        };
        const pair = colors[params.value] || '#f3f4f6:#374151';
        const [bg, color] = pair.split(':');
        const label = params.value.charAt(0).toUpperCase() + params.value.slice(1);
        return `<span style="background:${bg};color:${color};padding:2px 10px;border-radius:99px;font-size:0.72rem;font-weight:700;letter-spacing:0.04em;">${label}</span>`;
      },
    },
    {
      field: 'price',
      headerName: 'Price',
      width: 110,
      sortable: true,
      cellStyle: { fontWeight: '700', color: '#008174', fontSize: '0.9rem' },
      valueFormatter: (p: { value: number }) => `$${p.value.toFixed(2)}`,
    },
    {
      headerName: 'Rating',
      width: 130,
      sortable: true,
      valueGetter: (p: { data: IProduct }) => p.data.rating.rate,
      cellRenderer: (params: { value: number }) => {
        const full = Math.floor(params.value);
        const half = params.value % 1 >= 0.5;
        const stars = '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
        return `<div style="display:flex;align-items:center;gap:4px;">
          <span style="color:#f59e0b;font-size:0.75rem;letter-spacing:1px;">${stars}</span>
          <span style="color:#9aa3bb;font-size:0.75rem;">${params.value}</span>
        </div>`;
      },
    },
    {
      headerName: 'Reviews',
      width: 100,
      sortable: true,
      valueGetter: (p: { data: IProduct }) => p.data.rating.count,
      cellStyle: { color: '#5a6278', fontSize: '0.85rem', textAlign: 'center' },
    },
    {
      headerName: 'Status',
      width: 110,
      sortable: false,
      cellRenderer: (params: { data: IProduct }) => {
        const price = params.data.price;
        const label = price > 100 ? 'Premium' : price > 50 ? 'Mid-range' : 'Budget';
        const style =
          price > 100
            ? 'background:#008174;color:#fff'
            : price > 50
              ? 'background:#e8f5f0;color:#008174;border:1px solid #008174'
              : 'background:#f3f4f6;color:#5a6278';
        return `<span style="${style};padding:3px 10px;border-radius:6px;font-size:0.72rem;font-weight:700;letter-spacing:0.04em;">${label}</span>`;
      },
    },
  ];

  onGridReady(event: GridReadyEvent): void {
    this.gridApi = event.api;
    event.api.sizeColumnsToFit();
  }

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  setCategory(cat: string): void {
    this.activeCategory.set(cat);
  }

  exportCsv(): void {
    this.gridApi?.exportDataAsCsv({ fileName: 'products-export.csv' });
  }

  formatLabel(cat: string): string {
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  }
}
