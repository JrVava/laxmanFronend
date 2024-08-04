import axios from "axios"

console.log(process.env.REACT_APP_BACKEND_URL);
export const api = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL, // Ensure the protocol is included
  });