import { ProductService } from '../../core/services/product.service';
import { Component, inject, OnInit } from '@angular/core';
import { AllCommunityModule, ModuleRegistry, TextFilterModule } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular'; // Angular Data Grid Component
import type { ColDef, GridApi } from 'ag-grid-community'; // Column Definition Type Interface
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule, TextFilterModule]);

@Component({
  selector: 'app-dashboard',
  imports: [AgGridAngular],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent {
  // grid: GridApi;
  // ngOnInit(): void {
  //   console.log();
  // }

  // gridOptions = {
  //   onGridReady: (event) => {
  //     console.log(event.api); // Logs the grid API        event.api.sizeColumnsToFit(); // Example method call    }
  //   },
  // };
  product_service = inject(ProductService);
  rowData = toSignal(this.product_service.getProducts());

  // Column Definitions: Defines the columns to be displayed.
  colDefs: ColDef[] = [
    { field: 'id' },
    { field: 'title' },
    {
      field: 'price',
      cellRenderer: (params: { value: number }): string =>
        params.value > 20 ? 'LARGE VALUE' : 'SMALL VALUE',
    },
    { field: 'description' },
    { field: 'category', filter: true },
    { field: 'availability' },
    { headerName: 'rating_rate', valueGetter: (p) => p.data.rating.rate },
    { headerName: 'rating_count', valueGetter: (p) => p.data.rating.count },
  ];
}
