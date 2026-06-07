import { createSlice } from "@reduxjs/toolkit";

const dummyPurchaseData = Array.from({ length: 15 }, (_, i) => ({
  id: `purchase-${i + 1}`,
  data: [
    `PRO-${i + 1}`,
    `Vendor ${String.fromCharCode(65 + (i % 5))}`, // Vendor A–E
    `2025-07-${String(i + 1).padStart(2, "0")}T00:00:00.000Z`,
    [`ClassA/${(i + 1) * 10}`, `ClassB/${(i + 1) * 5}`],
    i % 3 === 0 ? "COMPLETED" : i % 3 === 1 ? "PENDING" : "DISPATCHED",
  ],
}));

const purchaseSlice = createSlice({
  name: "purchase",
  initialState: {
    item: dummyPurchaseData,
    page_no: 1,
    total_pages: 3, // Assuming 5 items per page
    total_items: dummyPurchaseData.length,
  },
  reducers: {
    resetPurchase: (state) => {
      state.item = [];
      state.page_no = 1;
      state.total_pages = 0;
      state.total_items = 0;
    },
    setPurchase: (state, action) => {
      const { item, page_no, total_pages, total_items } = action.payload;
      state.item = item ?? [];
      state.page_no = page_no ?? 1;
      state.total_pages = total_pages ?? 1;
      state.total_items = total_items ?? item?.length ?? 0;
    },
  },
});

export const { resetPurchase, setPurchase } = purchaseSlice.actions;
export default purchaseSlice.reducer;