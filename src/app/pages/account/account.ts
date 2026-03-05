import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-account',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './account.html',
  styleUrl: './account.scss',
})
export class AccountComponent {}
