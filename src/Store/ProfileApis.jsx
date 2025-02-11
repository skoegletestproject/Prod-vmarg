import axios from 'axios';

const {VITE_ENV,VITE_LOCAL_URL,VITE_WEB_URL} = import.meta.env

const BASE_URL = VITE_ENV==="local"?`${VITE_LOCAL_URL}/api/user/profile?token=${localStorage?.getItem("token")}`:`${VITE_WEB_URL}/api/user/profile?token=${localStorage?.getItem("token")}`

export const fetchUserProfile = async () => {
  try {
    const response = await axios.get(BASE_URL,{
        withCredentials:true
    });
    console.log('User Profile:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error.response?.data || error.message);
    throw error;
  }
};


export const updateUserProfile = async (profileData) => {
  try {
    const response = await axios.put(BASE_URL, profileData);
    console.log('Updated Profile:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error.response?.data || error.message);
    throw error;
  }
};

