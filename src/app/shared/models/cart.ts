export interface ICartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
  description: string;
  stock?: number;
}
