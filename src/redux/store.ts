import { configureStore } from '@reduxjs/toolkit'
import socketReducer from './socket/socket-slice'
import telegramIdReducer from './telegram-id-slice'
import telegramUsernameReducer from "./telegram-username-slice"

const store = configureStore({
    reducer: {
        socket: socketReducer,
        telegramId: telegramIdReducer,
        telegramUsername: telegramUsernameReducer
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
