

import { useState } from "react";
import Footer from "./Footor";
import LoginNav from "./LoginNav";
import Navbar from "./Navbar";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Layout({ children }) {

const [login,setLogin] = useState(false)
    
    return (
        <>

           <Navbar />
           <ToastContainer />
           {/* { login && ( <LoginNav/>)} */}
            <main>

                {children}
            </main>
            <Footer />
        </>

    )
}