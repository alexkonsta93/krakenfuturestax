import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Position } from '@/app/KrakenFuturesAdapter';

interface SliceState {
  positions: Position[];
}
const initialState: SliceState = {
  positions: []
};

const positionsSlice = createSlice({
  name: 'positions',
  initialState,
  reducers: {
    addPosition: (state: SliceState, action: PayloadAction<Position>) => {
      state.positions.push(action.payload);
    },
    addManyPositions: (state: SliceState, action: PayloadAction<Position[]>) => {
      state.positions = state.positions.concat(action.payload);
    },
    deleteAllPositions: (state: SliceState) => {
      state.positions = [];
    }
  }
});

export const { addPosition, addManyPositions, deleteAllPositions } = positionsSlice.actions;

export default positionsSlice.reducer;

