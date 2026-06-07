import {createSlice} from "@reduxjs/toolkit";

const salesSlice = createSlice({
  name: "sales",
  initialState: {
    data: [],       // sales list
    header: [],     // table header
    totalPages: 1,  // pagination
  },
  reducers: {
    setSales: (state, action) => {
      state.data = action.payload.item;
      state.header = action.payload.header;
      state.totalPages = action.payload.total_pages;
    },
    resetSales: (state) => {
      state.data = [];
      state.header = [];
      state.totalPages = 1;
    },
  },
});

export const {setSales, resetSales} = salesSlice.actions;
export default salesSlice.reducer;
