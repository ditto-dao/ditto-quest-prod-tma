import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface TelegramIdState {
    id: number | null
}

const initialState: TelegramIdState = {
    id: null,  // Initial state with no Telegram ID
}

const telegramIdSlice = createSlice({
    name: 'telegramId',
    initialState,
    reducers: {
        setTelegramId(state, action: PayloadAction<number>) {
            state.id = action.payload
        },
        clearTelegramId(state) {
            state.id = null
        }
    }
})

export const { setTelegramId, clearTelegramId } = telegramIdSlice.actions

export default telegramIdSlice.reducer
