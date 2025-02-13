import { createContext, useContext, useEffect, useState } from "react";
import { signup, login, logout, verifyUser } from "./AuthApis";
import { fetchUserProfile, updateUserProfile } from "./ProfileApis";
import { fetchDevicesByCustomerId,GetRegisterdDevices,deleteDeviceByDeviceString,deleteMultipleDevices,AddUser,addDevicesToCustomer, fetchCustomers, deleteCustomer, deleteRegesteredDevice } from "./DeviceApi";

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
  


  useEffect(() => {
    async function VeruserState() {
      try {
        const result = await verifyUser();

        if (result?.valid) {
          setisLogin(true);
          setisAdmin(result?.isAdmin || false);
          localStorage.setItem("isAdmin",result?.isAdmin)
          localStorage.setItem("isLogin",result?.valid)

        } else {
          handleLogout(); 
        }
      } catch (error) {
        console.error("Error verifying user:", error);
        handleLogout(); 
      }
    }
 if(isLogin){

   VeruserState();
 }
  }, []);

  const handleLogout = () => {
    logout(); 
    localStorage.clear(); 
    setisLogin(false);
    setisAdmin(false);
    settoken("");
    console.clear()
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
        fetchUserProfile,
        updateUserProfile,
        fetchDevicesByCustomerId,
        deleteDeviceByDeviceString,
        deleteMultipleDevices,
        addDevicesToCustomer,
        AddUser,
        fetchCustomers,
        deleteCustomer,
        GetRegisterdDevices,
        deleteRegesteredDevice
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}
