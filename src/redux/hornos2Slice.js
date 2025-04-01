import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedFurnace: null,
  furnaceData: [],
  furnaceDataFiltered: [],
  selectedChartFurnace: null,
};

const hornos2Slice = createSlice({
  name: "hornos2",
  initialState,
  reducers: {
    setSelectedFurnace: (state, action) => {
      state.selectedFurnace = action.payload;
    },
    setFurnaceData: (state, action) => {
      state.furnaceData = action.payload;
    },
    setFurnaceDataFiltered: (state, action) => {
      state.furnaceDataFiltered = action.payload;
    },
    setChartFurnace: (state, action) => {
      state.selectedChartFurnace = action.payload;
    },
  },
});

export const {
  setSelectedFurnace,
  setFurnaceData,
  setFurnaceDataFiltered,
  setChartFurnace,
} = hornos2Slice.actions;

export default hornos2Slice.reducer;
