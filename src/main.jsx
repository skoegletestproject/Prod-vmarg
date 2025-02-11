
import { createRoot } from 'react-dom/client'
import {StoreProvider} from "./Store/Store.jsx"
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
<StoreProvider>

    <App />
</StoreProvider>

)
