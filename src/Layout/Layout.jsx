

import { useState } from "react";
import Footer from "./Footor";
import LoginNav from "./LoginNav";
import Navbar from "./Navbar";



export default function Layout({ children }) {

const [login,setLogin] = useState(false)
    
    return (
        <>

           <Navbar />
           {/* { login && ( <LoginNav/>)} */}
            <main>

                {children}
            </main>
            <Footer />
        </>

    )
}