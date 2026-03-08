import { Component, signal, computed } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AccountComponent } from '../account';
import { AuthService } from '../../../core/services/auth-service';

export interface PaymentCard {
  id: string;
  type: 'visa' | 'mastercard' | 'amex' | 'other';
  last4: string;
  holder: string;
  expMonth: string;
  expYear: string;
  isDefault: boolean;
}

const CARDS_KEY = 'payment_cards';

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

  // ── Load from localStorage instead of hardcoded mock ─────────────────────
  readonly cards = signal<PaymentCard[]>(this.loadCards());

  readonly showAddForm = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly deleteConfirm = signal<string | null>(null);
  readonly error = signal('');
  readonly saveSuccess = signal(false);

  readonly defaultCard = computed(() => this.cards().find((c) => c.isDefault) ?? null);

  // ── localStorage helpers ──────────────────────────────────────────────────
  private loadCards(): PaymentCard[] {
    try {
      const raw = localStorage.getItem(CARDS_KEY);
      return raw ? (JSON.parse(raw) as PaymentCard[]) : [];
    } catch {
      return [];
    }
  }

  private syncCards(cards: PaymentCard[]): void {
    localStorage.setItem(CARDS_KEY, JSON.stringify(cards));
  }

  // ── Form ──────────────────────────────────────────────────────────────────
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
    // pre-fill holder with user's full name
    this.form.patchValue({ holder: this.fullName });
  }

  openEditForm(card: PaymentCard): void {
    this.editingId.set(card.id);
    this.showAddForm.set(true);
    this.form.patchValue({
      holder: card.holder,
      number: `000000000000${card.last4}`,
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

    let updated: PaymentCard[];

    if (this.editingId()) {
      updated = this.cards().map((c) =>
        c.id === this.editingId()
          ? { ...c, holder: holder!, last4, type, expMonth: expMonth!, expYear: expYear! }
          : c,
      );
    } else {
      const newCard: PaymentCard = {
        id: Date.now().toString(),
        type,
        last4,
        holder: holder!,
        expMonth: expMonth!,
        expYear: expYear!,
        isDefault: this.cards().length === 0, // first card becomes default
      };
      updated = [...this.cards(), newCard];

      // auto-save default_payment_id if this is the first card
      if (newCard.isDefault) {
        localStorage.setItem('default_payment_id', newCard.id);
      }
    }

    this.cards.set(updated);
    this.syncCards(updated); // ← persist to localStorage

    this.saveSuccess.set(true);
    this.cancelForm();
    setTimeout(() => this.saveSuccess.set(false), 3000);
  }

  setDefault(id: string): void {
    const updated = this.cards().map((c) => ({ ...c, isDefault: c.id === id }));
    this.cards.set(updated);
    this.syncCards(updated); // ← persist cards
    localStorage.setItem('default_payment_id', id); // ← persist default id
  }

  confirmDelete(id: string): void {
    this.deleteConfirm.set(id);
  }

  cancelDelete(): void {
    this.deleteConfirm.set(null);
  }

  deleteCard(id: string): void {
    const wasDefault = this.cards().find((c) => c.id === id)?.isDefault;
    let remaining = this.cards().filter((c) => c.id !== id);

    if (wasDefault && remaining.length > 0) {
      remaining[0] = { ...remaining[0], isDefault: true };
      localStorage.setItem('default_payment_id', remaining[0].id);
    }

    if (remaining.length === 0) {
      localStorage.removeItem('default_payment_id');
    }

    this.cards.set(remaining);
    this.syncCards(remaining); // ← persist to localStorage
    this.deleteConfirm.set(null);
  }
}
