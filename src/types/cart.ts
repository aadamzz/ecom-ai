export interface CartItem {
  product: import("./product").Product;
  size: string;
  quantity: number;
}
