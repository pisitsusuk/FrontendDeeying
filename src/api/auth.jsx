import axios from 'axios'


export const currentUser = async (token) => await axios.post('https://deeyingsystem.onrender.com/api/current-user', {}, {
    headers: {
        Authorization: `Bearer ${token}`
    }
})

export const currentAdmin = async (token) => {
    return await axios.post('https://deeyingsystem.onrender.com/api/current-admin', {}, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
}