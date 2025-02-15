import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Footer from "./Footor";
import LoginNav from "./LoginNav";
import Navbar from "./Navbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export default function Layout({ children, title }) {


    return (
        <>
            <Helmet>
                <title>{title ? title : "Vmarg"}</title>
                <meta name="description" content="Welcome to Skoegle, your go-to platform." />
            </Helmet>
            <Navbar />
            <ToastContainer />
            
            <main>{children}</main>
            <Footer />
        </>
    );
}
