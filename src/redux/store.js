import { configureStore } from "@reduxjs/toolkit";
import furnaceReducer from "./furnaceSlice";
import variablesReducer from "./variablesSlice";
import hornos2Reducer from "./hornos2Slice";

const store = configureStore({
  reducer: {
    furnace: furnaceReducer,
    variables: variablesReducer,
    hornos2: hornos2Reducer,
  },
});

export default store;
