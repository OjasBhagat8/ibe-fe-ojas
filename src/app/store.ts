import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import tenantReducer from "../features/tenant/tenantSlice";
import searchReducer from "../features/search/searchSlice";
import roomReducer from "../features/roomCard/roomResultSlice";
import dealsReducer from "../features/Deals/dealSlice";
import roomResultsPersistedReducer from "../features/roomResultsPersisted/roomResultsPersistedSlice";
import bookingReducer, { persistBookingState } from "../features/booking/bookingSlice";
import housekeepingAuthReducer from "../features/housekeepingAuth/housekeepingAuthSlice";
import tasksReducer from "../features/tasks/tasksSlice";
import attendanceReducer from "../features/attendance/attendanceSlice";
import leaveReducer from "../features/leave/leaveSlice";
import supervisorDashboardReducer from "../features/supervisorDashboard/supervisorDashboardSlice";
import roomStatusReducer from "../features/roomStatus/roomStatusSlice";
import supervisorTasksReducer from "../features/supervisorTasks/supervisorTasksSlice";

const rootReducer = combineReducers({
  tenant: tenantReducer,
  search: searchReducer,
  rooms: roomReducer,
  deals: dealsReducer,
  booking: bookingReducer,
  roomResultsPersisted: roomResultsPersistedReducer,
  housekeepingAuth: housekeepingAuthReducer,
  tasks: tasksReducer,
  attendance: attendanceReducer,
  leave: leaveReducer,
  supervisorDashboard: supervisorDashboardReducer,
  roomStatus: roomStatusReducer,
  supervisorTasks: supervisorTasksReducer,
});

const persistedReducer = persistReducer(
  {
    key: "root",
    storage,
    whitelist: ["roomResultsPersisted", "housekeepingAuth"],
  },
  rootReducer,
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
store.subscribe(() => {
  persistBookingState(store.getState().booking);
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
