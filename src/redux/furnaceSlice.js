import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedFurnace: null,
  furnaceData: [],
  furnaceDataFiltered: [],
  selectedChartFurnace: null
};

const furnaceSlice = createSlice({
  name: 'furnace',
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
    }
  },
});

export const { setSelectedFurnace, setFurnaceData, setFurnaceDataFiltered, setChartFurnace, setrowFurnace } = furnaceSlice.actions;

export default furnaceSlice.reducer;