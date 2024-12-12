import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface TelegramUsernameState {
    username: string | null
}

const initialState: TelegramUsernameState = {
    username: null,  // Initial state with no Telegram ID
}

const telegramUsernameSlice = createSlice({
    name: 'telegramUsername',
    initialState,
    reducers: {
        setTelegramUsername(state, action: PayloadAction<string>) {
            state.username = action.payload
        },
        clearTelegramUsername(state) {
            state.username = null
        }
    }
})

export const { setTelegramUsername, clearTelegramUsername } = telegramUsernameSlice.actions

export default telegramUsernameSlice.reducer
