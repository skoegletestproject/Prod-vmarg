import { createContext, useContext, useEffect, useState } from "react";
import { signup, login, logout, verifyUser } from "./AuthApis";
import { fetchUserProfile, updateUserProfile } from "./ProfileApis";
import { fetchDevicesByCustomerId,GetRegisterdDevices,deleteDeviceByDeviceString,deleteMultipleDevices,AddUser,addDevicesToCustomer, fetchCustomers, deleteCustomer } from "./DeviceApi";

const StoreContext = createContext(null);

export function useStore() {
  const contextValue = useContext(StoreContext);
  if (!contextValue) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return contextValue;
}

export function StoreProvider({ children }) {
  const [isLogin, setisLogin] = useState(localStorage?.getItem("isLogin") === "true");
  const [isAdmin, setisAdmin] = useState(localStorage?.getItem("isAdmin") === "true");
  const [token, settoken] = useState(localStorage?.getItem("token") || "");
  
  // console.log({ isLogin, isAdmin, token });

  useEffect(() => {
    async function VeruserState() {
      try {
        const result = await verifyUser();

        if (result?.valid) {
          setisLogin(true);
          setisAdmin(result?.isAdmin || false);
          localStorage.setItem("isAdmin",result?.isAdmin)
          localStorage.setItem("isLogin",result?.valid)
          // console.log("User verified successfully:", result);
        } else {
          handleLogout(); // Logout on invalid response
        }
      } catch (error) {
        console.error("Error verifying user:", error);
        handleLogout(); // Logout on error
      }
    }
 if(isLogin){

   VeruserState();
 }
  }, []);

  const handleLogout = () => {
    logout(); // Call your logout API
    localStorage.clear(); // Clear all local storage
    setisLogin(false);
    setisAdmin(false);
    settoken("");
    console.clear()
    // console.log("User logged out");
  };

  return (
    <StoreContext.Provider
      value={{
        signup,
        login,
        logout,
        setisAdmin,
        setisLogin,
        settoken,
        isLogin,
        isAdmin,
        token,
        user: true,
        fetchUserProfile,
        updateUserProfile,
        fetchDevicesByCustomerId,
        deleteDeviceByDeviceString,
        deleteMultipleDevices,
        addDevicesToCustomer,
        AddUser,
        fetchCustomers,
        deleteCustomer,
        GetRegisterdDevices
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}
