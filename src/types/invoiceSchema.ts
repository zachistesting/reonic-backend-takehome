/**
 * A customer invoice
 */
export interface Invoice {
  /**
   * Unique identifier for the invoice
   */
  invoiceId: string;
  /**
   * Human-readable invoice number
   */
  invoiceNumber: string;
  /**
   * Full name of the customer
   */
  customerName: string;
  /**
   * Customer's email address
   */
  customerEmail: string;
  /**
   * Customer's billing address
   */
  customerAddress?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    [k: string]: unknown;
  };
  /**
   * Date the invoice was issued
   */
  invoiceDate: string;
  /**
   * Payment due date
   */
  dueDate: string;
  /**
   * Line items on the invoice
   *
   * @minItems 1
   */
  items: [
    {
      /**
       * Description of the item or service
       */
      description: string;
      /**
       * Quantity of items
       */
      quantity: number;
      /**
       * Price per unit
       */
      unitPrice: number;
      /**
       * Total price for this line item (quantity * unitPrice)
       */
      total: number;
      [k: string]: unknown;
    },
    ...{
      /**
       * Description of the item or service
       */
      description: string;
      /**
       * Quantity of items
       */
      quantity: number;
      /**
       * Price per unit
       */
      unitPrice: number;
      /**
       * Total price for this line item (quantity * unitPrice)
       */
      total: number;
      [k: string]: unknown;
    }[],
  ];
  /**
   * Sum of all line items before tax
   */
  subtotal: number;
  /**
   * Tax amount
   */
  tax: number;
  /**
   * Total amount due (subtotal + tax)
   */
  total: number;
  /**
   * Currency code (ISO 4217)
   */
  currency?: string;
  /**
   * Current status of the invoice
   */
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  /**
   * Additional notes or comments
   */
  notes?: string;
  [k: string]: unknown;
}
