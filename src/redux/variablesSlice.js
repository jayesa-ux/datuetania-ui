import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  variablesData: []
};

const variablesSlice = createSlice({
  name: 'variables',
  initialState,
  reducers: {
    setvariables: (state, action) => {
      state.variablesData = action.payload;            
    },
  },
});

export const { setvariables } = variablesSlice.actions;
export default variablesSlice.reducer;
