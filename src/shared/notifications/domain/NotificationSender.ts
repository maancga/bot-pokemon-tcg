export interface CardData {
  title: string;
  price: string;
  link: string;
}

export interface NotificationSender {
  sendCardSync(cards: CardData[], storeName: string): Promise<void>;
}
