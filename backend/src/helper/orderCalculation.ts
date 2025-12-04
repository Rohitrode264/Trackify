import Big from 'big.js';

export function calcOrderTotals(
  items: Array<{ amount: number; isGstApplicable: boolean; gstPercent?: number }>,
  shippingCharge: number | undefined,
  isOrderGstApplicable: boolean
) {
  let subTotal = new Big(0);
  let totalGst = new Big(0);

  for (const it of items) {
    const amt = new Big(it.amount || 0);
    subTotal = subTotal.plus(amt);
    if (it.isGstApplicable && it.gstPercent) {
      const gst = amt.times(it.gstPercent).div(100);
      totalGst = totalGst.plus(gst);
    }
  }

  let shippingTax = new Big(0);
  if (shippingCharge && isOrderGstApplicable) {
    shippingTax = new Big(shippingCharge).times(18).div(100);
  }

  const grandTotal = subTotal.plus(totalGst).plus(shippingCharge || 0).plus(shippingTax);
  return {
    subTotal: Number(subTotal.round(2).toString()),
    totalGst: Number(totalGst.round(2).toString()),
    shippingTax: Number(shippingTax.round(2).toString()),
    grandTotal: Number(grandTotal.round(2).toString())
  };
}