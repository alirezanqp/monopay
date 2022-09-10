import * as t from 'io-ts';
import { z } from 'zod';

export const tBaseRequestOptions = t.intersection([
  t.interface({
    callbackUrl: t.string,
    amount: t.number,
  }),
  t.partial({
    description: t.string,
  }),
]);

export const baseConfigSchema = z.object({});

export type BaseConfigOptions = z.infer<typeof baseConfigSchema>;

export const baseRequestSchema = z.object({
  callbackUrl: z.string(),
  amount: z.number(),
  description: z.string().optional(),
});

export type BaseRequestOptions = z.infer<typeof baseRequestSchema>;

export const tBaseVerifyOptions = t.interface({
  amount: t.number,
});

export const baseVerifySchema = z.object({
  amount: z.number(),
});

export type BaseVerifyOptions = z.infer<typeof baseVerifySchema>;

export interface BaseReceipt<RawReceipt = any> {
  transactionId: string | number;
  cardPan?: string;
  raw: RawReceipt;
}

export interface PaymentInfo {
  method: 'GET' | 'POST';
  url: string;
  params: Record<string, any>;
}

export type ErrorList = Record<string, string>;

export type LinksObject = Record<
  string,
  {
    REQUEST: string;
    VERIFICATION: string;
    PAYMENT: string;
  }
>;
