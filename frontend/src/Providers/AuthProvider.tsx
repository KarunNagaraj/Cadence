import { useAuth } from "@clerk/clerk-react"
import React, { useEffect, useState } from "react"
import {axiosInstance} from "../lib/axios"
import { Loader } from "lucide-react";
import { useAuthStore } from "../stores/useAuthStore";
import { useChatStore } from "../stores/useChatStore";

const updateApiToken = (token: string | null) => {
	if (token) axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
	else delete axiosInstance.defaults.headers.common["Authorization"];
};


const AuthProvider = ({children}:{children:React.ReactNode}) => {
    const { getToken,userId } = useAuth()
    const [loading, setLoading] = useState(true)
    const { checkAdminStatus }= useAuthStore()
    const { initSocket, disconnectSocket } = useChatStore()


    useEffect(() => {
        const initAuth = async () => {
            try {
                if (!userId) {
                    updateApiToken(null)
                    disconnectSocket()
                    return
                }

                const token = await getToken()
                updateApiToken(token)

                if (token) {
                    await checkAdminStatus()
                    initSocket(userId)
                }
            } catch (error:any) {
                updateApiToken(null)
                disconnectSocket()
                console.error("Error fetching auth token:", error)
            }
            finally {
				setLoading(false);
			}
        }
       initAuth();

       return () => {
            disconnectSocket()
       }
    },[getToken, userId, checkAdminStatus, initSocket, disconnectSocket])

    if(loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center">
        <Loader className="size-8 text-red-500 animate-spin" />
        </div>
        )
    }
     return <div>{children}</div>
}
export default AuthProvider;
