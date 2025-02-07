import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Login from "./Pages/Login"
import Signup from "./Pages/Signup"
import Welcome from "./Pages/Welcome"
import Live from "./Pages/Live"
import Track from "./Pages/Track"
export default function App(){
const router = createBrowserRouter([
  {
    path:"/",
    element:<Welcome/>
  },
  {
    path:"/login",
    element:<Login/>
  },
  {
    path:"/signup",
    element:<Signup/>
  },
  {
    path:"/live",
    element:<Live/>
  },
  {
    path:"/track",
    element:<Track/>
  }
])
  
  return(
    
  <RouterProvider router={router}/>
  )
}