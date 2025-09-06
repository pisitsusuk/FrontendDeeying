import axios from "axios";

export const createUserCart = async (token, cart) => {
  // code body
  return axios.post("https://deeyingsystem.onrender.com/api/user/cart", cart, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const listUserCart = async (token) => {
  // code body
  return axios.get("https://deeyingsystem.onrender.com/api/user/cart", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const saveAddress = async (token, address) => {
  // code body
  return axios.post(
    "https://deeyingsystem.onrender.com/api/user/address",
    { address },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const saveOrder = async (token, payload) => {
  // code body
  return axios.post("https://deeyingsystem.onrender.com/api/user/order", payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getOrders = async (token) => {
  // code body
  return axios.get("https://deeyingsystem.onrender.com/api/user/order", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
