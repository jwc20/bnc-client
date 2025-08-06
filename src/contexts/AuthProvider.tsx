// import * as React from "react";
// import { AuthContext } from "./AuthContext";
// import { useUserStore } from "../stores/userStore";
//
// function AuthProvider({ children }) {
//     const {
//         token,
//         user,
//         isInitialized,
//         setToken,
//         setUser,
//         clearAuth,
//         signOut: storeSignOut,
//         isAuthenticated: storeIsAuthenticated
//     } = useUserStore();
//
//     const [loading, setLoading] = React.useState(!isInitialized);
//     const [error, setError] = React.useState(null);
//
//     // Wait for store to initialize
//     React.useEffect(() => {
//         if (isInitialized) {
//             setLoading(false);
//         }
//     }, [isInitialized]);
//
//     const signin = async (loginMutation, email, password) => {
//         setLoading(true);
//         setError(null);
//
//         try {
//             const response = await loginMutation.mutateAsync({
//                 body: { email, password }
//             });
//
//             // Handle different response structures
//             const responseData = response.data || response;
//             const { token: authToken, user: userData, access_token } = responseData;
//
//             // Use access_token if token is not available (common API pattern)
//             const finalToken = authToken || access_token;
//
//             setToken(finalToken);
//             setUser(userData);
//
//             return { success: true };
//         } catch (error) {
//             const errorMessage = error.message || error.error || 'Login failed';
//             setError(errorMessage);
//             return { success: false, error: errorMessage };
//         } finally {
//             setLoading(false);
//         }
//     };
//
//     const register = async (signupMutation, email, password) => {
//         setLoading(true);
//         setError(null);
//
//         try {
//             const response = await signupMutation.mutateAsync({
//                 body: { email, password }
//             });
//
//             // Assuming the API returns { token, user } or similar
//             const { token: authToken, user: userData } = response;
//
//             setToken(authToken);
//             setUser(userData);
//
//             return { success: true };
//         } catch (error) {
//             const errorMessage = error.message || 'Registration failed';
//             setError(errorMessage);
//             return { success: false, error: errorMessage };
//         } finally {
//             setLoading(false);
//         }
//     };
//
//     const signout = async () => {
//         setLoading(true);
//         try {
//             await storeSignOut();
//             setError(null);
//         } catch (error) {
//             console.error('Logout error:', error);
//         } finally {
//             setLoading(false);
//         }
//     };
//
//     const value = {
//         user,
//         token,
//         loading,
//         error,
//         signin,
//         register,
//         signout,
//         isAuthenticated: storeIsAuthenticated(),
//     };
//
//     return (
//         <AuthContext.Provider value={value}>
//             {children}
//         </AuthContext.Provider>
//     );
// }
//
// export { AuthProvider };