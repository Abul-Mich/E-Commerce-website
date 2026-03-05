// payment-options.component.ts

import { Component, signal, computed } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AccountComponent } from '../account';
import { AuthService } from '../../../core/services/auth-service';
import { IUser } from '../../../models/user';

export interface PaymentCard {
  id: string;
  type: 'visa' | 'mastercard' | 'amex' | 'other';
  last4: string;
  holder: string;
  expMonth: string;
  expYear: string;
  isDefault: boolean;
}

@Component({
  selector: 'app-payment-options',
  standalone: true,
  imports: [ReactiveFormsModule, AccountComponent],
  templateUrl: './payment-options.html',
  styleUrl: './payment-options.scss',
})
export class PaymentOptionsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  private readonly user = this.authService.currentUser();

  private get fullName(): string {
    return `${this.user?.firstName ?? ''} ${this.user?.lastName ?? ''}`.trim();
  }

  readonly cards = signal<PaymentCard[]>([
    {
      id: '1',
      type: 'visa',
      last4: '4242',
      holder: this.fullName,
      expMonth: '08',
      expYear: '2026',
      isDefault: true,
    },
    {
      id: '2',
      type: 'mastercard',
      last4: '8751',
      holder: this.fullName,
      expMonth: '03',
      expYear: '2027',
      isDefault: false,
    },
  ]);

  readonly showAddForm = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly deleteConfirm = signal<string | null>(null);
  readonly error = signal('');
  readonly saveSuccess = signal(false);

  readonly defaultCard = computed(() => this.cards().find((c) => c.isDefault) ?? null);

  // ── Add / Edit form ───────────────────────────────────────────────────────
  readonly form = this.fb.group({
    holder: ['', [Validators.required]],
    number: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
    expMonth: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])$/)]],
    expYear: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
  });

  // ── Helpers ───────────────────────────────────────────────────────────────
  cardTypeFromNumber(number: string): PaymentCard['type'] {
    if (number.startsWith('4')) return 'visa';
    if (/^5[1-5]/.test(number)) return 'mastercard';
    if (/^3[47]/.test(number)) return 'amex';
    return 'other';
  }

  maskedNumber(last4: string): string {
    return `•••• •••• •••• ${last4}`;
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  openAddForm(): void {
    this.form.reset();
    this.editingId.set(null);
    this.showAddForm.set(true);
    this.error.set('');
  }

  openEditForm(card: PaymentCard): void {
    this.editingId.set(card.id);
    this.showAddForm.set(true);
    this.form.patchValue({
      holder: card.holder,
      number: `000000000000${card.last4}`, // placeholder — real number not stored
      expMonth: card.expMonth,
      expYear: card.expYear,
      cvv: '',
    });
  }

  cancelForm(): void {
    this.showAddForm.set(false);
    this.editingId.set(null);
    this.form.reset();
    this.error.set('');
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const { holder, number, expMonth, expYear } = this.form.value;
    const last4 = number!.slice(-4);
    const type = this.cardTypeFromNumber(number!);

    if (this.editingId()) {
      // Update existing card
      this.cards.update((cards) =>
        cards.map((c) =>
          c.id === this.editingId()
            ? { ...c, holder: holder!, last4, type, expMonth: expMonth!, expYear: expYear! }
            : c,
        ),
      );
    } else {
      // Add new card
      const newCard: PaymentCard = {
        id: Date.now().toString(),
        type,
        last4,
        holder: holder!,
        expMonth: expMonth!,
        expYear: expYear!,
        isDefault: this.cards().length === 0,
      };
      this.cards.update((cards) => [...cards, newCard]);
    }

    this.saveSuccess.set(true);
    this.cancelForm();
    setTimeout(() => this.saveSuccess.set(false), 3000);
  }

  setDefault(id: string): void {
    this.cards.update((cards) => cards.map((c) => ({ ...c, isDefault: c.id === id })));
  }

  confirmDelete(id: string): void {
    this.deleteConfirm.set(id);
  }

  cancelDelete(): void {
    this.deleteConfirm.set(null);
  }

  deleteCard(id: string): void {
    const wasDefault = this.cards().find((c) => c.id === id)?.isDefault;
    this.cards.update((cards) => {
      const remaining = cards.filter((c) => c.id !== id);
      // Assign default to first card if the deleted one was default
      if (wasDefault && remaining.length > 0) {
        remaining[0].isDefault = true;
      }
      return remaining;
    });
    this.deleteConfirm.set(null);
  }
}
