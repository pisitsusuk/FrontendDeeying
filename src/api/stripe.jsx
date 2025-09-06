import axios from 'axios'


export const payment = async (token) => 
    await axios.post('https://deeyingsystem.onrender.com/api/user/create-payment-intent', {}, {
    headers: {
        Authorization: `Bearer ${token}`
    }
})