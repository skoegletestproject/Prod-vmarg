import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Login from "./Login"
import Signup from "./Signup"
import Welcome from "./welcome"
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
  }
])
  
  return(
    
  <RouterProvider router={router}/>
  )
}