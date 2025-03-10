import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface TelegramIdState {
    id: string | null
}

const initialState: TelegramIdState = {
    id: null,  // Initial state with no Telegram ID
}

const telegramIdSlice = createSlice({
    name: 'telegramId',
    initialState,
    reducers: {
        setTelegramId(state, action: PayloadAction<string>) {
            state.id = action.payload
        },
        clearTelegramId(state) {
            state.id = null
        }
    }
})

export const { setTelegramId, clearTelegramId } = telegramIdSlice.actions

export default telegramIdSlice.reducer
